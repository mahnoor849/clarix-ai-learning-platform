import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProfile, saveLearnerProfile } from '../services/storageService';
import { updateStreak, getOverallMastery, getRadarData, getUnlockedAchievements, ACHIEVEMENTS, getWeeklyActivity, getAccuracyRate, getTimeSpentMinutes, generateAIRecommendations, buildLearningRoadmap } from '../utils/analytics';
import SkillRadarChart from '../components/SkillRadarChart';
import { concepts, conceptOrder } from '../data/concepts';
import AppNavbar from '../components/AppNavbar';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const p = getActiveProfile();
    if (!p || !p.diagnostic_complete) { navigate('/learner'); return; }
    const updated = updateStreak(p);
    if (updated.streak_days !== p.streak_days) saveLearnerProfile(updated);
    setProfile(updated);
  }, [navigate]);

  if (!profile) return null;

  const radarData = getRadarData(profile);
  const achievements = getUnlockedAchievements(profile);
  const weekly = getWeeklyActivity(profile.learner_id);
  const accuracy = getAccuracyRate(profile.learner_id);
  const timeSpent = getTimeSpentMinutes(profile);
  const overall = getOverallMastery(profile);
  const recommendations = generateAIRecommendations(profile);
  const roadmap = buildLearningRoadmap(profile.mastery);
  const maxWeekly = Math.max(...weekly.map(w => w.count), 1);

  return (
    <div className="page-shell">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <AppNavbar
        showLinks={false}
        rightAction={
          <button onClick={() => navigate('/learner/dashboard')} className="btn-primary text-[13px] py-2 px-4 rounded-lg">
            Continue Learning
          </button>
        }
      />

      <main className="relative z-10 w-full">
        <section className="profile-hero hero-glow">
          <div className="page-container profile-hero-inner">
            <div className="profile-hero-info">
              <div className="profile-avatar profile-avatar-lg">{profile.name[0]}</div>
              <div className="profile-hero-text">
                <span className="section-label">Learning Analytics</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{profile.name}</h1>
                <p className="text-sm capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                  {profile.profile_type} learner · {profile.total_interactions || 0} interactions
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/learner/dashboard')} className="btn-secondary text-[13px] py-2.5 px-5">
              ← Back to Workspace
            </button>
          </div>
        </section>

        <div className="page-container profile-stack">
          <section className="profile-stats-grid">
            {[
              { label: 'Overall Mastery', value: `${overall}%`, icon: '📊', color: 'var(--color-primary-light)' },
              { label: 'Learning Streak', value: `${profile.streak_days || 0} days`, icon: '🔥', color: 'var(--color-accent-amber)' },
              { label: 'Accuracy Rate', value: `${accuracy}%`, icon: '🎯', color: 'var(--color-accent-emerald)' },
              { label: 'Time Spent', value: `${timeSpent} min`, icon: '⏱️', color: 'var(--color-accent-cyan)' },
            ].map(s => (
              <div key={s.label} className="stat-card profile-stat-card">
                <div className="profile-stat-label">
                  <span>{s.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
                </div>
                <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </section>

          <section className="profile-grid-5">
            <div className="glass-card profile-card">
              <div className="profile-card-header">
                <span className="section-label">Skills</span>
                <h3 className="profile-card-title">Skill Radar</h3>
                <p className="profile-card-desc">Your strength across all OOP modules</p>
              </div>
              <SkillRadarChart data={radarData} size={260} />
            </div>

            <div className="glass-card profile-card">
              <div className="profile-card-header">
                <span className="section-label">Progress</span>
                <h3 className="profile-card-title">Mastery Tracking</h3>
              </div>
              <div className="profile-mastery-list">
                {conceptOrder.map(id => {
                  const val = profile.mastery[id] || 0;
                  const pct = Math.round(val * 100);
                  const color = val >= 0.7 ? 'var(--color-accent-emerald)' : val >= 0.4 ? 'var(--color-accent-amber)' : 'var(--color-accent-rose)';
                  return (
                    <button key={id} onClick={() => navigate('/learner/dashboard')} className="profile-mastery-item group">
                      <div className="profile-mastery-row">
                        <span className="font-semibold text-white group-hover:text-[var(--color-primary-light)] transition-colors">{concepts[id].name}</span>
                        <span className="font-bold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div className="progress-fill transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="profile-grid-2">
            <div className="glass-card profile-card">
              <div className="profile-card-header">
                <span className="section-label">Activity</span>
                <h3 className="profile-card-title">Weekly Activity</h3>
              </div>
              <div className="profile-activity-chart">
                {weekly.map(w => {
                  const barH = Math.max(8, Math.round((w.count / maxWeekly) * 100));
                  return (
                    <div key={w.day} className="profile-activity-bar">
                      <span className="text-[10px] font-bold" style={{ color: w.count > 0 ? 'var(--color-primary-light)' : 'var(--color-text-muted)' }}>{w.count || ''}</span>
                      <div className="w-full rounded-md transition-all" style={{
                        height: `${barH}px`,
                        background: w.count > 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                      }} />
                      <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{w.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card profile-card">
              <div className="profile-card-header">
                <span className="section-label">AI Insights</span>
                <h3 className="profile-card-title">Recommendations</h3>
              </div>
              <div className="profile-recommendations">
                {recommendations.map((rec, i) => (
                  <div key={i} className="profile-recommendation">
                    <span className="text-sm">🤖</span>
                    <p>{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card profile-card">
            <div className="profile-card-header">
              <span className="section-label">Path</span>
              <h3 className="profile-card-title">Learning Roadmap</h3>
            </div>
            <div className="profile-roadmap-grid">
              {roadmap.map((item) => (
                <div key={item.id} className={`roadmap-item ${item.status}`}>
                  <div className="roadmap-marker">
                    {item.status === 'completed' ? '✓' : item.status === 'active' ? '→' : '·'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">{item.short}</div>
                    <div className="text-[11px] capitalize mt-1" style={{ color: 'var(--color-text-muted)' }}>{item.status} · {Math.round(item.mastery * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card profile-card">
            <div className="profile-achievements-header">
              <div className="profile-card-header">
                <span className="section-label">Rewards</span>
                <h3 className="profile-card-title">Achievements</h3>
              </div>
              <span className="text-[12px] font-bold px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(94,106,210,0.1)', color: 'var(--color-primary-light)' }}>
                {achievements.length}/{ACHIEVEMENTS.length} unlocked
              </span>
            </div>
            <div className="profile-achievements-grid">
              {ACHIEVEMENTS.map(a => {
                const unlocked = achievements.some(u => u.id === a.id);
                return (
                  <div key={a.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}>
                    <span className="text-2xl">{unlocked ? a.icon : '🔒'}</span>
                    <span className="text-[11px] font-bold text-white">{a.title}</span>
                    <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--color-text-muted)' }}>{a.desc}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
