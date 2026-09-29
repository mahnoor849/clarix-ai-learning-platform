import { concepts } from '../../data/concepts';
import { getWeakConcepts, getTodaysAlerts } from '../../utils/educatorAnalytics';

export default function EducatorInsightsPanel({ profiles, alerts, onSelectConcept, selectedConceptId }) {
  const insights = getWeakConcepts(profiles).slice(0, 4);
  const todayAlerts = getTodaysAlerts(alerts);

  return (
    <aside
      className="flex flex-col min-h-0 overflow-y-auto rounded-[14px] border bg-[#0A0A0A]"
      style={{ borderColor: 'var(--color-border)', padding: '32px 26px', gap: '36px' }}
    >
      <div className="flex flex-col flex-shrink-0" style={{ gap: '14px' }}>
        <span className="section-label" style={{ marginBottom: 0 }}>AI Recommendations</span>
        <h3 className="text-[15px] font-bold text-white m-0 leading-tight">Teaching Intelligence</h3>
        <p className="text-[11px] leading-relaxed m-0" style={{ color: 'var(--color-text-muted)' }}>
          Real-time class signals and suggested interventions.
        </p>
      </div>

      <div className="flex flex-col" style={{ gap: '16px' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Weak Concepts
        </div>
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {insights.length === 0 ? (
            <p className="text-[11px] m-0 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>No critical weak concepts detected.</p>
          ) : insights.map(c => {
            const isActive = selectedConceptId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectConcept?.(c.id)}
                className="flex items-center justify-between w-full rounded-xl border text-left transition-all"
                style={{
                  gap: '12px',
                  padding: '14px 16px',
                  borderColor: isActive ? 'rgba(94,106,210,0.3)' : 'var(--color-border)',
                  background: isActive ? 'rgba(94,106,210,0.08)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <span className="text-[12px] font-semibold text-white">{c.short}</span>
                <span className="text-[11px] font-bold" style={{ color: c.avg < 0.4 ? 'var(--color-accent-rose)' : 'var(--color-accent-amber)' }}>
                  {Math.round(c.avg * 100)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: '16px' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Intervention Suggestions
        </div>
        <div className="flex flex-col" style={{ gap: '14px' }}>
          {insights.slice(0, 2).map(c => (
            <div
              key={c.id}
              className="flex flex-col rounded-xl border"
              style={{ gap: '10px', padding: '18px', background: 'rgba(94,106,210,0.06)', borderColor: 'rgba(94,106,210,0.15)' }}
            >
              <span className="text-[12px] font-bold text-white">{c.short}</span>
              <p className="text-[11px] leading-relaxed m-0" style={{ color: 'var(--color-text-secondary)' }}>
                Schedule review session · Assign practice set · Mini quiz in 48h
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: '16px' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Today&apos;s Alerts
        </div>
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {todayAlerts.length === 0 ? (
            <p className="text-[11px] m-0 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>No urgent alerts today.</p>
          ) : todayAlerts.map((alert, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border"
              style={{ gap: '8px', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderColor: 'var(--color-border)' }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent-rose)' }}>
                {alert.severity.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-semibold text-white">{alert.learner}</span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {alert.concept ? concepts[alert.concept]?.short || alert.concept : 'General'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
