import { useState, useEffect } from 'react';

const STEPS = [
  { id: 1, title: 'Assess', desc: 'Diagnostic quiz maps your knowledge gaps across 6 OOP concepts', icon: '🔍', color: '#8E99F8' },
  { id: 2, title: 'Adapt', desc: 'AI engine selects teaching mode, difficulty, and pacing for you', icon: '⚡', color: '#38BDF8' },
  { id: 3, title: 'Teach', desc: 'Personalized lessons with code, analogies, and knowledge checks', icon: '📖', color: '#34D399' },
  { id: 4, title: 'Intervene', desc: 'Real-time tutor steps in when you struggle or show misconceptions', icon: '🤖', color: '#FBBF24' },
  { id: 5, title: 'Master', desc: 'Mastery tracking unlocks advanced content and next modules', icon: '🏆', color: '#FB7185' },
];

export default function AIWorkflowViz() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 2500);
    return () => clearInterval(interval);
  }, []);

  const step = STEPS[activeStep];

  return (
    <div className="workflow-viz">
      <div className="workflow-steps">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`workflow-step ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'done' : ''}`}
            onClick={() => setActiveStep(i)}
          >
            <div className="workflow-icon" style={{ background: `${s.color}20`, color: s.color, borderColor: `${s.color}40` }}>
              {s.icon}
            </div>
            <div className="workflow-connector" />
            <span className="text-[11px] font-bold text-white">{s.title}</span>
          </div>
        ))}
      </div>
      <div className="workflow-detail glass-card animate-fade-in" key={activeStep}>
        <div className="workflow-detail-header">
          <span className="text-2xl">{step.icon}</span>
          <div>
            <div className="workflow-detail-step" style={{ color: step.color }}>
              Step {step.id} of {STEPS.length}
            </div>
            <h4 className="workflow-detail-title">{step.title}</h4>
          </div>
        </div>
        <p className="workflow-detail-desc">{step.desc}</p>
      </div>
    </div>
  );
}
