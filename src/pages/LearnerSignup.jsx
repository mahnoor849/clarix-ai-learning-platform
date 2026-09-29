import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLearnerProfile, setActiveLearner } from '../services/storageService';
import AppNavbar from '../components/AppNavbar';

export default function LearnerSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    { id: 'beginner', icon: '🌱', title: 'Beginner', desc: 'New to programming or just starting with Java OOP.', mastery: { C001: 0, C002: 0, C003: 0, C004: 0, C005: 0, C006: 0 } },
    { id: 'intermediate', icon: '🔥', title: 'Intermediate', desc: 'Familiar with classes & objects, want to go deeper.', mastery: { C001: 0.5, C002: 0.3, C003: 0.1, C004: 0.1, C005: 0, C006: 0 } },
    { id: 'advanced', icon: '⚡', title: 'Advanced', desc: 'Strong OOP knowledge, refining edge cases & patterns.', mastery: { C001: 0.8, C002: 0.7, C003: 0.6, C004: 0.5, C005: 0.4, C006: 0.3 } },
  ];

  function handleCreate() {
    if (!name.trim() || !selectedLevel) return;
    const level = levels.find(l => l.id === selectedLevel);
    const id = 'L' + Date.now();
    createLearnerProfile({
      learner_id: id,
      name: name.trim(),
      profile_type: level.id,
      mastery: { ...level.mastery },
      diagnostic_complete: false,
      misconceptions_detected: [],
      total_interactions: 0,
      correct_answers: 0,
      hints_used: 0,
      current_concept: 'C001',
      streak_days: 0,
      tutor_sessions: 0,
    });
    setActiveLearner(id);
    navigate('/learner/diagnostic', { state: { learnerId: id } });
  }

  return (
    <div className="page-shell">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <AppNavbar showLinks={false} />

      <main
        className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)]"
        style={{ padding: '64px 28px 80px' }}
      >
        <div className="w-full animate-slide-up" style={{ maxWidth: '520px' }}>
          <header className="text-center flex flex-col items-center" style={{ gap: '16px', marginBottom: '48px' }}>
            <div className="profile-avatar profile-avatar-lg" style={{ marginBottom: '8px' }}>✨</div>
            <span className="section-label" style={{ marginBottom: 0 }}>New Learner</span>
            <h1 className="section-title m-0">Create your profile</h1>
            <p className="section-desc m-0">Tell us about your experience level</p>
          </header>

          <div className="animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: '36px' }}>
            <label className="section-label" style={{ marginBottom: '12px', display: 'block' }}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name..."
              style={{ padding: '14px 16px', width: '100%' }}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s', marginBottom: '40px' }}>
            <label className="section-label" style={{ marginBottom: '16px', display: 'block' }}>Experience Level</label>
            <div className="flex flex-col" style={{ gap: '14px' }}>
              {levels.map((level) => {
                const isSelected = selectedLevel === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`glass-card text-left flex items-start cursor-pointer transition-all w-full ${
                      isSelected ? 'border-[var(--color-primary-light)]' : ''
                    }`}
                    style={{
                      gap: '16px',
                      padding: '20px 22px',
                      ...(isSelected
                        ? { borderColor: 'rgba(142,153,248,0.4)', background: 'rgba(94,106,210,0.06)' }
                        : {}),
                    }}
                  >
                    <div className="profile-avatar text-xl flex-shrink-0">{level.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap" style={{ gap: '8px', marginBottom: '8px' }}>
                        <h3 className="font-bold text-white text-base m-0">{level.title}</h3>
                        {isSelected && (
                          <span className="badge badge-primary text-[9px]">Selected</span>
                        )}
                      </div>
                      <p className="text-sm m-0 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{level.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.3s', gap: '16px' }}>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || !selectedLevel}
              className="btn-primary w-full text-sm"
              style={{ padding: '14px 20px' }}
            >
              Start Diagnostic Assessment
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
            <button onClick={() => navigate('/learner')} className="btn-ghost text-xs" style={{ padding: '8px 16px' }}>
              ← Back to Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
