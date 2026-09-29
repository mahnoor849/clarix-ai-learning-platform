import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { getLearnerProfile, getRecentInteractions, generateAlerts } from '../services/storageService';
import { conceptOrder, concepts } from '../data/concepts';
import { questionBank } from '../data/questions';
import { generateInterventionPlan, isGeminiReady } from '../services/geminiService';
import { getOverallMastery } from '../utils/analytics';
import { getStudentJourney, getStudentRiskLevel, getConfidenceLabel, getHintUsageLabel } from '../utils/educatorAnalytics';
import StudentJourney from '../components/educator/StudentJourney';
import { RISK_STYLES } from '../components/educator/AtRiskStudents';

export default function LearnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [intervention, setIntervention] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const data = getLearnerProfile(id);
    if (!data) {
      navigate('/educator/dashboard');
      return;
    }
    setProfile(data);
    setInteractions(getRecentInteractions(id, 10).reverse());
    setAlerts(generateAlerts().filter(a => a.learner_id === id));
  }, [id, navigate]);

  async function handleGeneratePlan() {
    if (!profile) return;
    setGenerating(true);
    try {
      if (isGeminiReady) {
        const plan = await generateInterventionPlan(profile);
        setIntervention(plan);
      } else {
        setIntervention(`### Intervention Plan for ${profile.name}\n\n1. **Review prerequisites** — Focus on weakest module before advancing.\n2. **Scaffolded practice** — Assign 3 guided exercises with hint limits.\n3. **Check-in session** — 10-minute 1:1 to address confidence gaps.`);
      }
    } catch {
      setIntervention('Could not connect to AI. Review recent incorrect answers and focus on prerequisite concepts.');
    } finally {
      setGenerating(false);
    }
  }

  if (!profile) return null;

  const risk = getStudentRiskLevel(profile);
  const riskStyle = RISK_STYLES[risk === 'high' ? 'high' : risk === 'medium' ? 'medium' : 'low'];
  const journey = getStudentJourney(profile);

  return (
    <div className="educator-shell">
      <header className="educator-topbar">
        <div className="flex items-center gap-4">
          <Link to="/educator/dashboard" className="btn-ghost text-[12px] py-2 px-3">← Dashboard</Link>
          <div className="educator-topbar-title">
            <h1>{profile.name}</h1>
            <span>{profile.profile_type} learner · {getOverallMastery(profile)}% overall mastery</span>
          </div>
        </div>
        <span className="educator-risk-pill" style={{ color: riskStyle.color, background: riskStyle.bg, borderColor: riskStyle.border }}>
          {risk === 'high' ? 'High Risk' : risk === 'medium' ? 'Attention Needed' : 'Healthy'}
        </span>
      </header>

      <main className="educator-main" style={{ margin: '16px', flex: 1, minHeight: 0 }}>
        <div className="educator-main-body">
          <div className="educator-stack">
            <div className="educator-two-col">
              <section className="educator-card">
                <div className="educator-card-header">
                  <span className="section-label">Student Analytics</span>
                  <h3 className="educator-card-title">Mastery Breakdown</h3>
                </div>
                <div className="profile-mastery-list">
                  {conceptOrder.map(cId => {
                    const mastery = profile.mastery[cId] || 0;
                    const pct = Math.round(mastery * 100);
                    const color = mastery >= 0.7 ? 'var(--color-accent-emerald)' : mastery >= 0.4 ? 'var(--color-accent-amber)' : 'var(--color-accent-rose)';
                    return (
                      <div key={cId} className="profile-mastery-item">
                        <div className="profile-mastery-row">
                          <span className="font-semibold text-white">{concepts[cId].short}</span>
                          <span className="font-bold" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="progress-track" style={{ height: '6px' }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="educator-card">
                <div className="educator-card-header">
                  <span className="section-label">Student Journey</span>
                  <h3 className="educator-card-title">Learning Path</h3>
                </div>
                <StudentJourney journey={journey} />
              </section>
            </div>

            <div className="educator-command-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="educator-stat-card">
                <span className="educator-stat-label">Confidence</span>
                <span className="educator-stat-value" style={{ fontSize: '1.1rem' }}>{getConfidenceLabel(profile)}</span>
              </div>
              <div className="educator-stat-card">
                <span className="educator-stat-label">Hint Usage</span>
                <span className="educator-stat-value" style={{ fontSize: '1.1rem' }}>{getHintUsageLabel(profile)}</span>
              </div>
              <div className="educator-stat-card">
                <span className="educator-stat-label">Interactions</span>
                <span className="educator-stat-value" style={{ fontSize: '1.1rem' }}>{profile.total_interactions || 0}</span>
              </div>
              <div className="educator-stat-card">
                <span className="educator-stat-label">Hints Used</span>
                <span className="educator-stat-value" style={{ fontSize: '1.1rem' }}>{profile.hints_used || 0}</span>
              </div>
            </div>

            <div className="educator-two-col">
              <section className="educator-card">
                <div className="educator-card-header">
                  <span className="section-label">AI Intervention</span>
                  <h3 className="educator-card-title">Intervention Planner</h3>
                </div>
                {!intervention ? (
                  <>
                    <p className="educator-card-desc">Generate a personalized 3-step intervention plan based on this student&apos;s metrics.</p>
                    <button onClick={handleGeneratePlan} disabled={generating} className="btn-primary text-[13px] py-2.5 px-5">
                      {generating ? 'Generating...' : 'Generate Plan'}
                    </button>
                  </>
                ) : (
                  <div className="educator-quiz-output markdown-content">
                    <Markdown>{intervention}</Markdown>
                    <button onClick={() => setIntervention(null)} className="btn-ghost text-xs mt-4">Clear Plan</button>
                  </div>
                )}
              </section>

              <section className="educator-card">
                <div className="educator-card-header">
                  <span className="section-label">Misconceptions</span>
                  <h3 className="educator-card-title">Detected Patterns</h3>
                </div>
                {(profile.misconceptions_detected || []).length === 0 ? (
                  <p className="educator-empty-state">No persistent misconceptions cataloged.</p>
                ) : (
                  <ul className="educator-risk-list">
                    {[...new Set(profile.misconceptions_detected)].map((mId, i) => (
                      <li key={i} className="educator-ai-insight warning">
                        <span className="educator-ai-insight-icon">⚠</span>
                        <p>{mId}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {alerts.length > 0 && (
              <section className="educator-card">
                <div className="educator-card-header">
                  <span className="section-label">Alerts</span>
                  <h3 className="educator-card-title">Active Profile Alerts</h3>
                </div>
                <div className="educator-risk-list">
                  {alerts.map((alert, i) => (
                    <div key={i} className="educator-risk-card" style={{ background: 'rgba(251,113,133,0.06)', borderColor: 'rgba(251,113,133,0.2)' }}>
                      <span className="educator-risk-badge" style={{ color: 'var(--color-accent-rose)' }}>{alert.severity.replace('_', ' ')}</span>
                      <p className="text-sm font-semibold text-white mt-2 mb-1">{alert.message}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{alert.action}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="educator-card">
              <div className="educator-card-header">
                <span className="section-label">Timeline</span>
                <h3 className="educator-card-title">Recent Interactions</h3>
              </div>
              <div className="educator-live-list">
                {interactions.length === 0 ? (
                  <p className="educator-empty-state">No learning records found.</p>
                ) : interactions.map((i) => {
                  let qText = 'Tutor interaction or diagnostic';
                  if (i.question_id !== 'TUTOR' && !i.question_id.startsWith('DQ')) {
                    const q = questionBank.find(q => q.id === i.question_id);
                    if (q) qText = q.text.length > 80 ? q.text.substring(0, 80) + '...' : q.text;
                  }
                  return (
                    <div key={i.interaction_id} className="educator-live-item">
                      <div className="educator-live-avatar">{i.is_correct ? '✓' : '✗'}</div>
                      <div className="educator-live-info">
                        <span className="educator-live-name">{i.concept_id} · {i.question_id}</span>
                        <span className="educator-live-detail">{qText}</span>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          Confidence {i.confidence_before_answer}/5 · Hints {i.hints_requested} · {new Date(i.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
