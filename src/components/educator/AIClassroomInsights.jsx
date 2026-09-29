import { generateClassroomInsights } from '../../utils/educatorAnalytics';
import EducatorCard from './EducatorCard';

const INSIGHT_STYLES = {
  warning: { border: 'rgba(251,191,36,0.2)', bg: 'rgba(251,191,36,0.06)' },
  success: { border: 'rgba(52,211,153,0.2)', bg: 'rgba(52,211,153,0.06)' },
  info: { border: 'var(--color-border)', bg: 'rgba(255,255,255,0.02)' },
};

export default function AIClassroomInsights({ profiles }) {
  const insights = generateClassroomInsights(profiles);

  return (
    <EducatorCard label="AI Classroom Intelligence" title="AI Insights">
      <div className="flex flex-col" style={{ gap: '14px' }}>
        {insights.map((insight, i) => {
          const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.info;
          return (
            <div
              key={i}
              className="flex items-start rounded-xl border"
              style={{ gap: '16px', padding: '16px 20px', borderColor: style.border, background: style.bg }}
            >
              <span className="text-sm flex-shrink-0">
                {insight.type === 'warning' ? '⚠' : insight.type === 'success' ? '✓' : '◆'}
              </span>
              <p className="text-[13px] leading-relaxed m-0" style={{ color: 'var(--color-text-secondary)' }}>{insight.text}</p>
            </div>
          );
        })}
      </div>
    </EducatorCard>
  );
}
