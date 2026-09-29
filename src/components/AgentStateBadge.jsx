import { useState, useEffect } from 'react';

const stateConfig = {
  Idle: { color: 'var(--color-text-muted)', label: 'Idle' },
  Diagnosing: { color: 'var(--color-accent-amber)', label: 'Diagnosing' },
  Teaching: { color: 'var(--color-primary-light)', label: 'Teaching' },
  Assessing: { color: 'var(--color-accent-emerald)', label: 'Assessing' },
  Tutoring: { color: 'var(--color-accent-cyan)', label: 'Tutoring' },
  'Updating Profile': { color: 'var(--color-accent-emerald)', label: 'Updating Profile' },
  'Thinking...': { color: 'var(--color-secondary)', label: 'Thinking...' },
  Evaluating: { color: 'var(--color-accent-amber)', label: 'Evaluating' },
};

export default function AgentStateBadge({ state = 'Idle' }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = stateConfig[state] || stateConfig.Idle;

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [state]);

  const isThinking = state === 'Thinking...';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 ${isAnimating ? 'animate-scale-in' : ''} glass-card`}
         style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
      
      {/* Status Dot */}
      <div className="relative flex items-center justify-center w-3 h-3">
        <div className={`absolute w-full h-full rounded-full opacity-30 ${isThinking ? 'animate-ping' : ''}`} 
             style={{ backgroundColor: config.color }}></div>
        <div className="w-2 h-2 rounded-full z-10" style={{ backgroundColor: config.color }}></div>
      </div>
      
      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)' }}>
        Agent Status:
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: config.color }}>
        {config.label}
      </span>
      
      {isThinking && (
        <span className="flex gap-1 ml-1">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1 h-1 rounded-full"
              style={{ 
                backgroundColor: config.color, 
                animation: `pulse-dot 0.8s ease-in-out ${i * 0.2}s infinite` 
              }} />
          ))}
        </span>
      )}
    </div>
  );
}
