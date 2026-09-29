import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '📊', title: 'Class Health', desc: 'Real-time mastery scores and at-risk student detection' },
  { icon: '🤖', title: 'AI Insights', desc: 'Weak concept alerts and intervention recommendations' },
  { icon: '⚡', title: 'Live Monitoring', desc: 'Track student activity and engagement as it happens' },
];

export default function EducatorLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (password === 'educator123') {
      sessionStorage.setItem('educator_name', 'Dr. Ahmed');
      sessionStorage.setItem('educator_authenticated', 'true');
      navigate('/educator/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="page-shell min-h-screen w-full">
      <div className="bg-grid pointer-events-none absolute inset-0" />

      <main
        className="relative z-10 w-full min-h-screen flex flex-col items-center animate-slide-up"
        style={{ padding: '80px 28px 64px' }}
      >
        <div
          className="w-full flex flex-col items-center"
          style={{ maxWidth: '440px', gap: '48px' }}
        >
          <header className="w-full flex flex-col items-center text-center" style={{ gap: '28px' }}>
            <div
              className="educator-brand-icon flex items-center justify-center font-extrabold text-white"
              style={{ width: '72px', height: '72px', borderRadius: '16px', fontSize: '24px' }}
            >
              C
            </div>

            <div className="flex flex-col items-center" style={{ gap: '16px' }}>
              <h1 className="font-extrabold tracking-tight leading-none text-white m-0" style={{ fontSize: 'clamp(3.5rem, 10vw, 5.5rem)' }}>
                Clarix
              </h1>
              <span className="section-label" style={{ marginBottom: 0 }}>Educator Access</span>
            </div>

            <div className="flex flex-col items-center" style={{ gap: '12px', maxWidth: '380px' }}>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug m-0">
                Teaching Intelligence Portal
              </h2>
              <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--color-text-secondary)' }}>
                AI-powered classroom analytics and intervention planning
              </p>
            </div>
          </header>

          <div
            className="glass-card w-full rounded-2xl"
            style={{ padding: '32px 36px' }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '24px' }}>
              <div className="flex flex-col" style={{ gap: '12px' }}>
                <label htmlFor="educator-password" className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Access Code
                </label>
                <input
                  id="educator-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter educator password..."
                  className={`w-full ${error ? 'border-[var(--color-accent-rose)]' : ''}`}
                  style={{ padding: '14px 16px' }}
                />
                {error && (
                  <p className="text-xs m-0" style={{ color: 'var(--color-accent-rose)' }}>
                    Invalid access code. Please try again.
                  </p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full text-sm" style={{ padding: '14px 20px' }}>
                Access Command Center
              </button>
            </form>
          </div>

          <button onClick={() => navigate('/')} className="btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>
            ← Back to Home
          </button>
        </div>

        <div
          className="w-full mx-auto grid grid-cols-1 sm:grid-cols-3 animate-slide-up"
          style={{
            maxWidth: '760px',
            marginTop: '56px',
            gap: '20px',
            animationDelay: '0.1s',
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col rounded-2xl border text-left h-full transition-colors hover:border-[rgba(255,255,255,0.15)]"
              style={{
                gap: '18px',
                padding: '24px 26px',
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="flex items-center justify-center text-xl border flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(94,106,210,0.08)',
                  borderColor: 'rgba(94,106,210,0.15)',
                }}
              >
                {f.icon}
              </div>
              <div className="flex flex-col flex-1" style={{ gap: '10px' }}>
                <h3 className="text-[15px] font-bold text-white leading-tight m-0">{f.title}</h3>
                <p className="text-xs leading-relaxed m-0" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
