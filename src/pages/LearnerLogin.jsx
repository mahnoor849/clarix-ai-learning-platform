import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProfiles, resetAllData, setActiveLearner } from '../services/storageService';
import AppNavbar from '../components/AppNavbar';

export default function LearnerLogin() {
  const navigate = useNavigate();
  const [profiles] = useState(() => Object.values(getAllProfiles()));
  const [showReset, setShowReset] = useState(false);

  function handleSelectProfile(p) {
    setActiveLearner(p.learner_id);
    if (p.diagnostic_complete) {
      navigate('/learner/dashboard');
    } else {
      navigate('/learner/diagnostic', { state: { learnerId: p.learner_id } });
    }
  }

  function handleReset() {
    resetAllData();
    window.location.reload();
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
            <div className="profile-avatar profile-avatar-lg" style={{ marginBottom: '8px' }}>🎓</div>
            <span className="section-label" style={{ marginBottom: 0 }}>Learner Portal</span>
            <h1 className="section-title m-0">Welcome back</h1>
            <p className="section-desc m-0">Select your profile to continue learning</p>
          </header>

          <div className="flex flex-col animate-slide-up" style={{ animationDelay: '0.1s', gap: '14px', marginBottom: '40px' }}>
            {profiles.map((p) => {
              const avgMastery = Object.values(p.mastery).reduce((a, b) => a + b, 0) / Math.max(Object.values(p.mastery).length, 1);
              return (
                <button
                  key={p.learner_id}
                  onClick={() => handleSelectProfile(p)}
                  className="w-full glass-card flex items-center text-left group cursor-pointer hover:border-[var(--color-border-hover)] transition-all"
                  style={{ gap: '16px', padding: '20px 22px' }}
                >
                  <div className="profile-avatar flex-shrink-0">{p.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap" style={{ gap: '8px', marginBottom: '8px' }}>
                      <span className="font-bold text-white text-sm group-hover:text-[var(--color-primary-light)] transition-colors">{p.name}</span>
                      {p.diagnostic_complete ? (
                        <span className="badge badge-success text-[9px]">Ready</span>
                      ) : (
                        <span className="badge badge-warning text-[9px]">Needs Diagnostic</span>
                      )}
                    </div>
                    <div
                      className="flex items-center flex-wrap text-[11px]"
                      style={{ gap: '8px 12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}
                    >
                      <span className="capitalize">{p.profile_type}</span>
                      <span>·</span>
                      <span>{Math.round(avgMastery * 100)}% mastery</span>
                      <span>·</span>
                      <span>{p.total_interactions} sessions</span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 flex-shrink-0 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    style={{ color: 'var(--color-primary-light)' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col animate-slide-up" style={{ animationDelay: '0.2s', gap: '20px' }}>
            <button
              onClick={() => navigate('/learner/signup')}
              className="btn-primary w-full text-sm"
              style={{ padding: '14px 20px' }}
            >
              Create New Profile
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            </button>

            <div className="flex justify-between items-center" style={{ paddingTop: '4px' }}>
              <button onClick={() => navigate('/')} className="btn-ghost text-xs" style={{ padding: '8px 12px' }}>
                ← Back to Home
              </button>
              <button
                onClick={() => setShowReset(!showReset)}
                className="btn-ghost text-xs"
                style={{ color: 'var(--color-accent-rose)', padding: '8px 12px' }}
              >
                Reset Data
              </button>
            </div>
          </div>

          {showReset && (
            <div
              className="glass-card text-center animate-fade-in"
              style={{ marginTop: '28px', padding: '24px 28px', borderColor: 'rgba(251,113,133,0.2)' }}
            >
              <p className="text-sm font-semibold text-white m-0" style={{ marginBottom: '8px' }}>Delete all learning data?</p>
              <p className="text-xs m-0" style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                This action cannot be undone.
              </p>
              <div className="flex justify-center" style={{ gap: '12px' }}>
                <button
                  onClick={handleReset}
                  className="btn-secondary text-xs"
                  style={{ color: 'var(--color-accent-rose)', borderColor: 'rgba(251,113,133,0.3)', padding: '10px 16px' }}
                >
                  Confirm Delete
                </button>
                <button onClick={() => setShowReset(false)} className="btn-ghost text-xs" style={{ padding: '10px 16px' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
