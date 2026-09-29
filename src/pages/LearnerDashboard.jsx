import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MasteryPanel from '../components/MasteryPanel';
import TeachingPanel from '../components/TeachingPanel';
import AssessmentPanel from '../components/AssessmentPanel';
import AssignedWorkPanel from '../components/AssignedWorkPanel';
import TutorModePanel from '../components/TutorModePanel';
import { getActiveProfile, saveLearnerProfile, getPendingAssignmentsForLearner } from '../services/storageService';
import { updateStreak, getOverallMastery } from '../utils/analytics';

const AGENT_COLORS = {
  Idle: 'var(--color-text-muted)',
  Diagnosing: 'var(--color-accent-amber)',
  Teaching: 'var(--color-primary-light)',
  Assessing: 'var(--color-accent-emerald)',
  Tutoring: 'var(--color-accent-cyan)',
  'Updating Profile': 'var(--color-accent-emerald)',
  'Thinking...': 'var(--color-secondary)',
  Evaluating: 'var(--color-accent-amber)',
};

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [currentConcept, setCurrentConcept] = useState('C001');
  const [mainMode, setMainMode] = useState('teaching');
  const [agentState, setAgentState] = useState('Teaching');
  const [lessonContext, setLessonContext] = useState('');
  const [pendingAssigned, setPendingAssigned] = useState(0);

  useEffect(() => {
    const active = getActiveProfile();
    if (active) {
      const updated = updateStreak(active);
      if (updated.streak_days !== active.streak_days) saveLearnerProfile(updated);
      setProfile(updated);
      setCurrentConcept(updated.current_concept || 'C001');
      setPendingAssigned(getPendingAssignmentsForLearner(updated.learner_id).length);
    } else {
      navigate('/learner');
    }
  }, [navigate]);

  function refreshPendingCount(learnerId) {
    setPendingAssigned(getPendingAssignmentsForLearner(learnerId).length);
  }

  function handleConceptSelect(id) {
    setCurrentConcept(id);
    setMainMode('teaching');
    if (profile) {
      const updated = { ...profile, current_concept: id };
      saveLearnerProfile(updated);
      setProfile(updated);
    }
  }

  if (!profile) return null;

  const overall = getOverallMastery(profile);
  const agentColor = AGENT_COLORS[agentState] || AGENT_COLORS.Idle;

  return (
    <div className="workspace-root">
      {/* Top Nav */}
      <header className="workspace-nav">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] text-white flex items-center justify-center text-xs font-bold border flex-shrink-0"
            style={{ borderColor: 'var(--color-border)' }}>C</div>
          <span className="text-[13px] font-semibold text-white hidden sm:block whitespace-nowrap">
            <span className="font-bold text-sm text-white tracking-tight">Clarix</span>
          </span>
          <div className="h-3 w-px bg-white/15 hidden sm:block" />
          <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider truncate"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
            {profile.name}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="agent-pill hidden md:flex" style={{ color: agentColor, borderColor: `${agentColor}33` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: agentColor }} />
            {agentState}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: 'rgba(94,106,210,0.1)', color: 'var(--color-primary-light)' }}>
            {overall}% mastery
          </div>
          {(profile.streak_days || 0) > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--color-accent-amber)' }}>
              🔥 {profile.streak_days}d
            </div>
          )}
          <button onClick={() => navigate('/learner/profile')} className="btn-ghost text-[10px] uppercase tracking-wider px-2">Analytics</button>
          <button onClick={() => navigate('/learner')} className="btn-ghost text-[10px] uppercase tracking-wider px-2">Switch</button>
        </div>
      </header>

      {/* Three-Column Grid — fills full viewport width */}
      <div
        className="workspace-grid"
        style={{ gridTemplateColumns: '272px minmax(0, 1fr) 308px', gap: '20px', padding: '0 20px 20px' }}
      >
        {/* Left: Curriculum */}
        <aside className="workspace-sidebar">
          <MasteryPanel
            profile={profile}
            currentConcept={currentConcept}
            onSelectConcept={handleConceptSelect}
          />
        </aside>

        {/* Center: Lesson */}
        <section className="workspace-main">
          <div className="workspace-main-header">
            <button type="button" onClick={() => setMainMode('teaching')}
              className={`mode-tab ${mainMode === 'teaching' ? 'active' : ''}`}>Lesson</button>
            <button type="button" onClick={() => setMainMode('assessment')}
              className={`mode-tab ${mainMode === 'assessment' ? 'active' : ''}`}>Assessment</button>
            <button type="button" onClick={() => setMainMode('assigned')}
              className={`mode-tab ${mainMode === 'assigned' ? 'active' : ''}`} style={{ position: 'relative' }}>
              Assigned
              {pendingAssigned > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--color-accent-amber)', color: '#000' }}
                >
                  {pendingAssigned}
                </span>
              )}
            </button>
            <span className="ml-auto text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {mainMode === 'teaching' ? '⚡ Adaptive mode' : mainMode === 'assessment' ? '📝 Quiz mode' : '📋 Teacher assignments'}
            </span>
          </div>
          <div className="workspace-main-body">
            {mainMode === 'teaching' ? (
              <TeachingPanel
                key={`teach-${currentConcept}`}
                profile={profile}
                conceptId={currentConcept}
                onAgentStateChange={setAgentState}
                onStartAssessment={() => setMainMode('assessment')}
                onLessonContextChange={setLessonContext}
              />
            ) : mainMode === 'assessment' ? (
              <AssessmentPanel
                key={`assess-${currentConcept}`}
                profile={profile}
                conceptId={currentConcept}
                onAgentStateChange={setAgentState}
                onProfileUpdate={setProfile}
                onBackToTeaching={() => setMainMode('teaching')}
              />
            ) : (
              <AssignedWorkPanel
                key={`assigned-${profile.learner_id}`}
                profile={profile}
                onAgentStateChange={setAgentState}
                onComplete={() => refreshPendingCount(profile.learner_id)}
              />
            )}
          </div>
        </section>

        {/* Right: AI Tutor */}
        <aside className="workspace-tutor">
          <TutorModePanel
            profile={profile}
            conceptId={currentConcept}
            lessonContext={lessonContext}
            onAgentStateChange={setAgentState}
            onProfileUpdate={setProfile}
          />
        </aside>
      </div>
    </div>
  );
}
