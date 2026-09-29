import { Link } from 'react-router-dom';
import EducatorCard from './EducatorCard';

const RISK_STYLES = {
  high: { label: 'High Risk', color: 'var(--color-accent-rose)', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)' },
  medium: { label: 'Attention Needed', color: 'var(--color-accent-amber)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  low: { label: 'Healthy', color: 'var(--color-accent-emerald)', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
};

export default function AtRiskStudents({ students }) {
  const highRisk = students.filter(s => s.risk === 'high');
  const mediumRisk = students.filter(s => s.risk === 'medium');
  const atRisk = [...highRisk, ...mediumRisk].slice(0, 5);

  return (
    <EducatorCard label="Student Risk Detection" title="At-Risk Students">
      {atRisk.length === 0 ? (
        <p className="text-sm text-center m-0" style={{ color: 'var(--color-text-muted)', padding: '24px 0' }}>
          All students are within healthy learning ranges.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: '14px' }}>
          {atRisk.map(student => {
            const style = RISK_STYLES[student.risk];
            return (
              <div
                key={student.learner_id}
                className="rounded-xl border flex flex-col"
                style={{
                  gap: '14px',
                  padding: '18px 20px',
                  background: style.bg,
                  borderColor: style.border,
                }}
              >
                <div className="flex items-center justify-between" style={{ gap: '12px' }}>
                  <Link to={`/educator/learner/${student.learner_id}`} className="text-[14px] font-bold text-white">
                    {student.name}
                  </Link>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded-full"
                    style={{ color: style.color, padding: '4px 10px', background: 'rgba(0,0,0,0.15)' }}
                  >
                    {style.label}
                  </span>
                </div>

                <div
                  className="flex flex-wrap text-[11px]"
                  style={{ gap: '16px 24px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
                >
                  <span>Mastery: <strong className="text-white">{student.overallMastery}%</strong></span>
                  <span>Confidence: <strong className="text-white">{student.confidenceLabel}</strong></span>
                  <span>Hint Usage: <strong className="text-white">{student.hintLabel}</strong></span>
                </div>

                <p className="text-[11px] font-semibold m-0" style={{ color: 'var(--color-primary-light)', paddingTop: '2px' }}>
                  Recommendation: Schedule intervention
                </p>
              </div>
            );
          })}
        </div>
      )}
    </EducatorCard>
  );
}

export { RISK_STYLES };
