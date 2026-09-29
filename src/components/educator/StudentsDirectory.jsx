import { Link } from 'react-router-dom';
import { conceptOrder, concepts } from '../../data/concepts';
import { getStudentRiskLevel } from '../../utils/educatorAnalytics';
import { getOverallMastery } from '../../utils/analytics';
import { RISK_STYLES } from './AtRiskStudents';

export default function StudentsDirectory({ profiles }) {
  const list = Object.values(profiles);

  return (
    <section
      className="rounded-xl border overflow-hidden w-full"
      style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="px-7 pt-6 pb-5 flex flex-col gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-bold text-white m-0">Learner Directory</h3>
        <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--color-text-muted)' }}>
          Individual mastery tracking and risk levels across all modules
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border)', background: 'rgba(0,0,0,0.3)' }}>
              <th className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>Student</th>
              {conceptOrder.map(id => (
                <th key={id} title={concepts[id].name} className="px-4 py-5 text-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                  {concepts[id].short.split(' ')[0]}
                </th>
              ))}
              <th className="px-6 py-5 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Overall</th>
              <th className="px-6 py-5 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Risk</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => {
              const risk = getStudentRiskLevel(p);
              const style = RISK_STYLES[risk === 'high' ? 'high' : risk === 'medium' ? 'medium' : 'low'];
              return (
                <tr key={p.learner_id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-6 py-5">
                    <Link to={`/educator/learner/${p.learner_id}`} className="flex items-center gap-3.5 group">
                      <span
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 border"
                        style={{ background: '#1E1E1E', borderColor: 'var(--color-border)' }}
                      >
                        {p.name[0]}
                      </span>
                      <span className="min-w-0">
                        <strong className="block text-[14px] text-white group-hover:text-[var(--color-primary-light)] transition-colors">{p.name}</strong>
                        <small className="block text-[11px] capitalize mt-1" style={{ color: 'var(--color-text-muted)' }}>{p.profile_type}</small>
                      </span>
                    </Link>
                  </td>
                  {conceptOrder.map(id => {
                    const m = p.mastery[id] || 0;
                    const pct = Math.round(m * 100);
                    const color = m >= 0.7 ? 'var(--color-accent-emerald)' : m >= 0.4 ? 'var(--color-accent-amber)' : 'var(--color-accent-rose)';
                    return (
                      <td key={id} className="px-4 py-5 text-center font-semibold text-[13px]" style={{ color }}>{pct}%</td>
                    );
                  })}
                  <td className="px-6 py-5 text-center font-bold text-white text-[13px]">{getOverallMastery(p)}%</td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className="inline-block text-[10px] font-bold px-3.5 py-1.5 rounded-full border"
                      style={{ color: style.color, background: style.bg, borderColor: style.border }}
                    >
                      {risk === 'high' ? 'High' : risk === 'medium' ? 'Medium' : 'Low'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
