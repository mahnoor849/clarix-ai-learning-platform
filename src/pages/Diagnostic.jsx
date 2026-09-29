import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import { diagnosticQuestions } from '../data/questions';
import { concepts } from '../data/concepts';
import { getRecommendedConcept } from '../engine/adaptationEngine';
import { saveLearnerProfile, getLearnerProfile, setActiveLearner, getAllProfiles } from '../services/storageService';
import { buildLearningRoadmap } from '../utils/analytics';
import { generateStudentProfile, isGeminiReady } from '../services/geminiService';
import AgentStateBadge from '../components/AgentStateBadge';
import AppNavbar from '../components/AppNavbar';

export default function Diagnostic() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [agentState, setAgentState] = useState('Idle');
  const [aiProfile, setAiProfile] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const learnerId = location.state?.learnerId;
    let activeProfile = learnerId ? getLearnerProfile(learnerId) : null;
    if (!activeProfile) {
      activeProfile = Object.values(getAllProfiles()).find(p => !p.diagnostic_complete);
    }
    if (activeProfile) {
      setProfile(activeProfile);
      setActiveLearner(activeProfile.learner_id);
      setAgentState('Diagnosing');
    } else {
      navigate('/learner');
    }
  }, [navigate, location.state]);

  function handleNext() {
    if (!selectedOption) return;
    const currentQ = diagnosticQuestions[currentIdx];
    const isCorrect = selectedOption === currentQ.answer;

    setAnswers(prev => [...prev, { questionId: currentQ.id, conceptId: currentQ.concept, isCorrect, confidence, selected: selectedOption }]);

    if (currentIdx < diagnosticQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption('');
      setConfidence(3);
    } else {
      finishDiagnostic(isCorrect);
    }
  }

  async function finishDiagnostic(lastCorrect) {
    setAgentState('Updating Profile');

    const finalAnswers = [...answers, {
      questionId: diagnosticQuestions[currentIdx].id,
      conceptId: diagnosticQuestions[currentIdx].concept,
      isCorrect: lastCorrect,
      confidence,
      selected: selectedOption,
    }];

    const newMastery = { ...profile.mastery };
    finalAnswers.forEach(ans => {
      let current = newMastery[ans.conceptId] || 0.2;
      if (ans.isCorrect) current += ans.confidence >= 4 ? 0.2 : 0.1;
      else current -= ans.confidence >= 4 ? 0.1 : 0.05;
      newMastery[ans.conceptId] = Math.max(0, Math.min(1, parseFloat(current.toFixed(2))));
    });

    const recommendation = getRecommendedConcept(newMastery);
    const updatedProfile = {
      ...profile,
      mastery: newMastery,
      diagnostic_complete: true,
      current_concept: recommendation.concept || 'C001',
      last_active: new Date().toISOString(),
      diagnostic_results: finalAnswers,
    };

    saveLearnerProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsComplete(true);
    setAgentState('Thinking...');
    setLoadingProfile(true);

    if (isGeminiReady) {
      try {
        const summary = await generateStudentProfile(updatedProfile, finalAnswers);
        setAiProfile(summary);
      } catch {
        setAiProfile(generateFallbackProfile(updatedProfile, finalAnswers));
      }
    } else {
      setAiProfile(generateFallbackProfile(updatedProfile, finalAnswers));
    }
    setLoadingProfile(false);
    setAgentState('Idle');
  }

  if (!profile) return null;

  if (isComplete) {
    const recommendation = getRecommendedConcept(profile.mastery);
    const roadmap = buildLearningRoadmap(profile.mastery);

    return (
      <div className="page-shell">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <AppNavbar showLinks={false} />
        <AgentStateBadge state={agentState} />
        <main className="relative z-10 page-container-narrow py-12 space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="profile-avatar profile-avatar-lg mx-auto mb-5">🎯</div>
            <span className="section-label">Diagnostic Complete</span>
            <h1 className="section-title">Your AI learning profile</h1>
            <p className="section-desc">Personalized from your diagnostic results</p>
          </div>

          {/* AI Profile */}
          <div className="glass-card p-6">
            <span className="section-label">AI Analysis</span>
            {loadingProfile ? (
              <div className="space-y-3">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-3/5 bg-white/5 rounded animate-pulse" />
              </div>
            ) : (
              <div className="markdown-content text-[13px]">
                <Markdown>{aiProfile}</Markdown>
              </div>
            )}
          </div>

          {/* Learning Roadmap */}
          <div className="glass-card p-6">
            <span className="section-label">Roadmap</span>
            <h3 className="text-lg font-bold text-white mb-6">Personalized learning path</h3>
            <div className="space-y-3">
              {roadmap.map((item, i) => (
                <div key={item.id} className={`roadmap-item ${item.status}`}>
                  <div className="roadmap-marker">
                    {item.status === 'completed' ? '✓' : item.status === 'active' ? '→' : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-white">{item.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider roadmap-status">{item.status}</span>
                    </div>
                    <div className="progress-track mt-2" style={{ height: '3px' }}>
                      <div className="progress-fill" style={{ width: `${Math.round(item.mastery * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border text-center" style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary-light)' }}>Recommended Starting Point</p>
            <p className="text-base font-bold text-white mb-1">{recommendation.concept ? concepts[recommendation.concept]?.name : 'Advanced Challenges'}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{recommendation.reason}</p>
          </div>

          <button onClick={() => navigate('/learner/dashboard')} className="btn-primary w-full py-3.5 text-sm">
            Enter Learning Workspace →
          </button>
        </main>
      </div>
    );
  }

  const currentQ = diagnosticQuestions[currentIdx];
  const progress = ((currentIdx) / diagnosticQuestions.length) * 100;

  return (
    <div className="page-shell">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <AppNavbar showLinks={false} />
      <AgentStateBadge state={agentState} />
      <main className="relative z-10 flex items-center justify-center px-6 py-16 min-h-[calc(100vh-64px)]">
        <div className="page-container-narrow w-full">
          <div className="mb-8">
            <span className="section-label">Onboarding</span>
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl font-bold text-white">Diagnostic Assessment</h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(94,106,210,0.1)', color: 'var(--color-primary-light)' }}>
                {currentIdx + 1} / {diagnosticQuestions.length}
              </span>
            </div>
            <p className="text-[13px] mb-4" style={{ color: 'var(--color-text-muted)' }}>Mapping your knowledge to build a personalized path</p>
            <div className="progress-track" style={{ height: '4px' }}>
              <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }} />
            </div>
          </div>

          <div className="glass-card p-8 animate-fade-in" key={currentIdx}>
            <span className="badge mb-4" style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            {currentQ.difficulty} · {currentQ.concept}
          </span>
          <h2 className="text-lg font-bold text-white mb-6 leading-relaxed">{currentQ.text}</h2>

          <div className="space-y-3 mb-8">
            {currentQ.options.map((opt, i) => (
              <button key={i} onClick={() => setSelectedOption(opt)}
                className={`option-btn ${selectedOption === opt ? 'selected' : ''}`}>
                <span className="text-sm font-bold" style={{ color: selectedOption === opt ? 'var(--color-primary-light)' : 'var(--color-text-muted)' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>

          {selectedOption && (
            <div className="animate-slide-up mb-8 p-5 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
              <label className="flex justify-between items-center text-sm font-semibold mb-3">
                <span style={{ color: 'var(--color-text-secondary)' }}>How confident are you?</span>
                <span className="text-white">{confidence} / 5</span>
              </label>
              <input type="range" min="1" max="5" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} className="w-full mb-3" />
              <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                <span>Guessing</span><span>Certain</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
            <button onClick={handleNext} disabled={!selectedOption} className="btn-primary py-2.5 px-6">
              {currentIdx === diagnosticQuestions.length - 1 ? 'Generate My Profile' : 'Next Question'}
            </button>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function generateFallbackProfile(profile, results) {
  const correct = results.filter(r => r.isCorrect).length;
  const strengths = results.filter(r => r.isCorrect).map(r => r.conceptId);
  const weaknesses = results.filter(r => !r.isCorrect).map(r => r.conceptId);
  return `## Learning Style Assessment\n\nBased on your diagnostic (${correct}/${results.length} correct), you show a **${profile.profile_type}** learning pattern with ${profile.confidence || 'moderate'} confidence.\n\n### Strengths\n- ${strengths.length > 0 ? strengths.join(', ') : 'Foundational concepts'}\n\n### Areas to Improve\n- ${weaknesses.length > 0 ? weaknesses.join(', ') : 'Advanced topics'}\n\n### Recommended Pace\n**Moderate** — Start with guided lessons and use the AI tutor when concepts feel unclear.`;
}
