import { Link } from 'react-router-dom';
import EducatorCard from './EducatorCard';

export default function LiveMonitoring({ activities }) {
  return (
    <EducatorCard label="Real-Time Monitoring" title="Current Active Students">
      <div className="flex flex-col gap-3">
        {activities.map(a => (
          <Link
            key={a.learner_id}
            to={`/educator/learner/${a.learner_id}`}
            className="flex items-center gap-4 px-4 py-4 rounded-xl border transition-all hover:border-[rgba(94,106,210,0.25)]"
            style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 border"
              style={{ background: '#1E1E1E', borderColor: 'var(--color-border)' }}
            >
              {a.name[0]}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-[13px] font-bold text-white">{a.name}</span>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                {a.status === 'viewing' && `Viewing ${a.detail}`}
                {a.status === 'quiz' && a.detail}
                {a.status === 'hints' && a.detail}
              </span>
            </div>
            <span
              className="text-sm flex-shrink-0"
              style={{
                color: a.status === 'hints' ? 'var(--color-accent-amber)' : a.status === 'quiz' ? 'var(--color-accent-rose)' : 'var(--color-accent-emerald)',
              }}
            >
              {a.status === 'hints' ? '⚠' : a.status === 'quiz' ? '?' : '●'}
            </span>
          </Link>
        ))}
      </div>
    </EducatorCard>
  );
}
