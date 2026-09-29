import { getEducatorName } from '../../utils/educatorAnalytics';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function CommandCenter({ classHealth, atRiskCount, avgMastery, activeToday, onViewInsights }) {
  const stats = [
    { label: 'Class Health Score', value: `${classHealth}%`, color: 'var(--color-primary-light)' },
    { label: 'At-Risk Students', value: atRiskCount, color: 'var(--color-accent-rose)' },
    { label: 'Average Mastery', value: `${avgMastery}%`, color: 'var(--color-accent-emerald)' },
    { label: 'Active Students Today', value: activeToday, color: 'var(--color-accent-cyan)' },
  ];

  return (
    <section
      className="rounded-xl border flex flex-col"
      style={{
        borderColor: 'var(--color-border)',
        background: 'linear-gradient(180deg, rgba(94,106,210,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        padding: '32px',
        gap: '28px',
      }}
    >
      <div className="flex flex-wrap items-start justify-between" style={{ gap: '24px' }}>
        <div className="flex flex-col max-w-lg" style={{ gap: '12px' }}>
          <span className="section-label" style={{ marginBottom: 0 }}>{getGreeting()}</span>
          <h2 className="text-2xl font-extrabold text-white m-0 leading-tight">{getEducatorName()}</h2>
          <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--color-text-secondary)' }}>
            Your AI teaching assistant has analyzed class performance overnight.
          </p>
        </div>
        <button onClick={onViewInsights} className="btn-primary text-[12px] py-2.5 px-5 flex-shrink-0">
          View Insights
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '16px' }}>
        {stats.map(s => (
          <div
            key={s.label}
            className="flex flex-col rounded-xl border"
            style={{ gap: '12px', padding: '20px', borderColor: 'var(--color-border)', background: 'rgba(0,0,0,0.25)' }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              {s.label}
            </span>
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
