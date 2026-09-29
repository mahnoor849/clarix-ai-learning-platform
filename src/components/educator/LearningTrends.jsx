import { getWeeklyMasteryTrend, getConfidenceTrend, getHintDependencyCount } from '../../utils/educatorAnalytics';
import EducatorCard from './EducatorCard';

export default function LearningTrends({ profiles }) {
  const trend = getWeeklyMasteryTrend(profiles);
  const confidence = getConfidenceTrend(profiles);
  const hintDep = getHintDependencyCount(profiles);
  const maxPct = Math.max(...trend.map(t => t.pct), 1);

  return (
    <EducatorCard label="Educator Analytics" title="Learning Trends">
      <div className="flex flex-col" style={{ gap: '36px' }}>
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            Average Mastery
          </span>
          <div className="flex items-end justify-center" style={{ gap: '24px', height: '160px', maxWidth: '520px', margin: '0 auto' }}>
            {trend.map(t => (
              <div key={t.week} className="flex flex-col items-center justify-end" style={{ gap: '10px', width: '72px', height: '100%' }}>
                <span className="text-[11px] font-bold" style={{ color: 'var(--color-primary-light)' }}>{t.pct}%</span>
                <div className="w-full flex-1 flex items-end rounded-t-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="w-full rounded-t-md min-h-[8px] transition-all duration-500"
                    style={{ height: `${(t.pct / maxPct) * 100}%`, background: 'var(--color-primary)' }}
                  />
                </div>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{t.week}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: '20px' }}>
          <div className="rounded-xl border flex flex-col" style={{ borderColor: 'var(--color-border)', background: 'rgba(0,0,0,0.2)', padding: '20px', gap: '10px' }}>
            <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Student Confidence</span>
            <span className="text-xl font-extrabold" style={{ color: 'var(--color-accent-emerald)' }}>↑ {confidence.change}%</span>
          </div>
          <div className="rounded-xl border flex flex-col" style={{ borderColor: 'var(--color-border)', background: 'rgba(0,0,0,0.2)', padding: '20px', gap: '10px' }}>
            <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Hint Dependency</span>
            <span className="text-xl font-extrabold" style={{ color: hintDep > 0 ? 'var(--color-accent-amber)' : 'var(--color-accent-emerald)' }}>
              {hintDep} students
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>relying heavily on hints</span>
          </div>
        </div>
      </div>
    </EducatorCard>
  );
}
