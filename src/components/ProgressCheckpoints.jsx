const CHECKPOINTS = [
  { id: 'read', label: 'Read Lesson', icon: '📖' },
  { id: 'code', label: 'Run Code', icon: '💻' },
  { id: 'check', label: 'Knowledge Check', icon: '✓' },
  { id: 'assess', label: 'Assessment', icon: '📝' },
];

export default function ProgressCheckpoints({ completed = [] }) {
  const doneCount = completed.length;
  const pct = Math.round((doneCount / CHECKPOINTS.length) * 100);

  return (
    <div className="progress-checkpoints">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Lesson Progress</span>
        <span className="text-[11px] font-bold" style={{ color: 'var(--color-primary-light)' }}>{pct}%</span>
      </div>
      <div className="progress-track mb-4" style={{ height: '3px' }}>
        <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary-light)' }} />
      </div>
      <div className="checkpoint-row">
        {CHECKPOINTS.map((cp, i) => {
          const isDone = completed.includes(cp.id);
          const isActive = !isDone && (i === 0 || completed.includes(CHECKPOINTS[i - 1].id));
          return (
            <div key={cp.id} className={`checkpoint-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
              <span className="checkpoint-icon">{isDone ? '✓' : cp.icon}</span>
              <span className="checkpoint-label">{cp.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
