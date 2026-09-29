export default function StudentJourney({ journey }) {
  return (
    <div className="educator-journey">
      {journey.map((step, i) => {
        const color = step.mastery >= 0.7 ? 'var(--color-accent-emerald)' : step.mastery >= 0.4 ? 'var(--color-accent-amber)' : 'var(--color-accent-rose)';
        return (
          <div key={step.id} className="educator-journey-step">
            <div className="educator-journey-node" style={{ borderColor: color, background: `${color}15` }}>
              <span style={{ color }}>{step.pct}%</span>
            </div>
            <div className="educator-journey-label">
              <span className="text-[12px] font-semibold text-white">{step.short}</span>
            </div>
            {i < journey.length - 1 && <div className="educator-journey-line" />}
          </div>
        );
      })}
    </div>
  );
}
