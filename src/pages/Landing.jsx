import { useNavigate } from 'react-router-dom';
import { conceptOrder, concepts } from '../data/concepts';
import InteractiveDemo from '../components/InteractiveDemo';
import AIWorkflowViz from '../components/AIWorkflowViz';
import AnimatedCounter from '../components/AnimatedCounter';
import AppNavbar from '../components/AppNavbar';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: '⚡', title: 'Adaptive Learning Engine', desc: 'Real-time lesson adaptation based on mastery levels, response confidence, and cognitive patterns.' },
    { icon: '🎯', title: 'Misconception Profiling', desc: 'Pinpoints exact cognitive gaps by tracking error patterns across Java OOP subconcepts.' },
    { icon: '🤖', title: 'Contextual AI Tutor', desc: 'One-click actions — Explain Again, Simplify, Quiz Me — plus free-form chat.' },
  ];

  return (
    <div className="page-shell flex flex-col items-center">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <AppNavbar />

      <main className="landing-main">
        <section className="landing-hero hero-glow">
          <div className="landing-hero-content animate-slide-up">
            <div className="flex flex-col items-center gap-5 mb-2">
              <div className="educator-brand-icon w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl text-xl md:text-2xl font-extrabold">C</div>
              <span className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white leading-none">
                Clarix
              </span>
            </div>
            <div className="landing-hero-badge animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent-emerald)' }} />
              <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-primary)' }}>AI-Powered Adaptive Learning</span>
            </div>
            <h1 className="landing-hero-title">
              Master Java OOP with an <span className="text-gradient">AI tutor that adapts to you.</span>
            </h1>
            <p className="landing-hero-desc">
              Not another static course. A living platform that assesses, teaches, intervenes, and tracks your mastery in real time.
            </p>
            <div className="landing-hero-actions">
              <button onClick={() => navigate('/learner')} className="btn-primary py-3.5 px-8 text-sm">
                Start Learning for Free
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <a href="#demo" className="btn-secondary py-3.5 px-8 text-sm">Watch It Adapt Live</a>
            </div>
          </div>
        </section>

        <section id="demo" className="landing-section">
          <div className="landing-section-inner page-container">
            <div className="landing-section-header">
              <span className="section-label">Live Product Demo</span>
              <h2 className="section-title">See the AI tutor in action</h2>
              <p className="section-desc">
                Watch how Clarix detects struggle, adapts difficulty, and responds with personalized explanations.
              </p>
            </div>
            <InteractiveDemo />
          </div>
        </section>

        <section className="landing-section page-section-alt">
          <div className="landing-section-inner landing-section-inner-narrow page-container">
            <div className="landing-section-header">
              <h2 className="section-title">Proven learning outcomes</h2>
              <p className="section-desc">Students using adaptive AI tutoring see measurable improvement</p>
            </div>
            <div className="landing-metrics-grid">
              <AnimatedCounter end={87} suffix="%" label="Mastery Improvement" />
              <AnimatedCounter end={3} suffix="x" label="Faster Comprehension" />
              <AnimatedCounter end={94} suffix="%" label="Student Satisfaction" />
              <AnimatedCounter end={12} suffix=" min" label="Avg. Session Length" />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-section">
          <div className="landing-section-inner landing-section-inner-workflow page-container">
            <div className="landing-section-header">
              <span className="section-label">How It Works</span>
              <h2 className="section-title">The adaptive learning loop</h2>
              <p className="section-desc">
                Every interaction feeds back into the engine. The platform continuously reshapes itself around your progress.
              </p>
            </div>
            <AIWorkflowViz />
          </div>
        </section>

        <section id="features" className="landing-section page-section-alt">
          <div className="landing-section-inner page-container">
            <div className="landing-section-header">
              <h2 className="section-title">Built for deep comprehension</h2>
              <p className="section-desc">
                Interactive lessons, runnable code, knowledge checks, and an AI tutor that never just displays static content.
              </p>
            </div>
            <div className="landing-features-grid">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="feature-card landing-feature-card group flex flex-col gap-5 p-7 md:p-8 rounded-2xl h-full"
                >
                  <div
                    className="landing-feature-icon w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'rgba(94,106,210,0.08)', borderColor: 'rgba(94,106,210,0.15)' }}
                  >
                    {f.icon}
                  </div>
                  <div className="flex flex-col gap-2.5 flex-1">
                    <h3 className="landing-feature-title text-base">{f.title}</h3>
                    <p className="landing-feature-desc text-[13px]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="curriculum" className="landing-section">
          <div className="landing-section-inner page-container">
            <div className="landing-curriculum-header">
              <div className="landing-curriculum-intro">
                <span className="section-label">Curriculum</span>
                <h2 className="section-title">Structured learning path</h2>
                <p className="section-desc">
                  Six modules with interactive code, assessments, and adaptive difficulty — unlocked by mastery, not time.
                </p>
              </div>
              <button onClick={() => navigate('/learner')} className="btn-secondary text-[13px] py-2.5 px-5 flex-shrink-0">
                Start Free Assessment
              </button>
            </div>
            <div className="landing-curriculum-grid">
              {conceptOrder.map((id, index) => {
                const c = concepts[id];
                return (
                  <div key={id} className="card landing-curriculum-card group hover:-translate-y-1 transition-transform">
                    <div className="landing-curriculum-card-top">
                      <div className="landing-curriculum-index">{String(index + 1).padStart(2, '0')}</div>
                      <span className="landing-curriculum-difficulty">{c.difficulty}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3 className="landing-curriculum-title">{c.name}</h3>
                      <p className="landing-curriculum-desc">{c.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-inner page-container-narrow">
            <h2 className="section-title">Ready to learn differently?</h2>
            <p className="section-desc">
              Take the 5-minute diagnostic. Get your AI-generated profile and personalized roadmap instantly.
            </p>
            <button onClick={() => navigate('/learner')} className="btn-primary py-3.5 px-10 text-sm">
              Begin Diagnostic Assessment
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner page-container">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold bg-[#1E1E1E] border" style={{ borderColor: 'var(--color-border)' }}>C</div>
            <span className="font-semibold text-base text-white">Clarix</span>
          </div>
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>© 2026 Clarix Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
