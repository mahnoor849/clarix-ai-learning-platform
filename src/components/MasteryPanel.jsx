import { useState } from 'react';
import { concepts, conceptOrder } from '../data/concepts';
import { getRecommendedConcept } from '../engine/adaptationEngine';

function getMasteryColor(v) {
  if (v >= 0.7) return 'var(--color-accent-emerald)';
  if (v >= 0.4) return 'var(--color-accent-amber)';
  return 'var(--color-accent-rose)';
}

function getModuleStatus(id, mastery, profileMastery) {
  const m = mastery || 0;
  if (m >= 0.85) return 'mastered';
  const prereqs = concepts[id].prerequisites || [];
  const locked = prereqs.some(p => (profileMastery[p] || 0) < 0.3);
  if (locked) return 'locked';
  return 'available';
}

export default function MasteryPanel({ profile, onSelectConcept, currentConcept }) {
  const [search, setSearch] = useState('');
  if (!profile) return null;

  const recommendation = getRecommendedConcept(profile.mastery);
  const filtered = conceptOrder.filter(id => {
    const c = concepts[id];
    return c.name.toLowerCase().includes(search.toLowerCase()) ||
           c.short.toLowerCase().includes(search.toLowerCase());
  });

  const overallPct = Math.round(
    (Object.values(profile.mastery).reduce((a, b) => a + b, 0) / 6) * 100
  );
  const masteredCount = conceptOrder.filter(id => (profile.mastery[id] || 0) >= 0.85).length;

  return (
    <div className="h-full flex flex-col min-h-0" style={{ background: '#0A0A0A' }}>
      <div
        className="border-b flex-shrink-0 flex flex-col"
        style={{ padding: '24px 20px', gap: '14px', borderColor: 'var(--color-border)' }}
      >
        <span className="section-label" style={{ marginBottom: 0 }}>Curriculum</span>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Course Progress
          </span>
          <span className="text-[12px] font-bold" style={{ color: 'var(--color-primary-light)' }}>{overallPct}%</span>
        </div>
        <div className="progress-track" style={{ height: '5px' }}>
          <div className="progress-fill" style={{ width: `${overallPct}%`, backgroundColor: 'var(--color-primary-light)' }} />
        </div>
        <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>{masteredCount}/6 mastered</span>
          <span>{profile.name}</span>
        </div>
      </div>

      <div className="flex-shrink-0" style={{ padding: '18px 20px' }}>
        <div className="relative">
          <svg
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="sidebar-search"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '4px 16px 20px' }}>
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {filtered.map((id, index) => {
            const concept = concepts[id];
            const mastery = profile.mastery[id] || 0;
            const pct = Math.round(mastery * 100);
            const color = getMasteryColor(mastery);
            const isActive = currentConcept === id;
            const status = getModuleStatus(id, mastery, profile.mastery);

            return (
              <button
                key={id}
                onClick={() => onSelectConcept(id)}
                className={`sidebar-module ${isActive ? 'active' : ''} ${status}`}
                style={{ padding: '16px', gap: '14px' }}
              >
                <div className="sidebar-module-index" data-active={isActive}>
                  {status === 'mastered' ? '✓' : status === 'locked' ? '·' : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between" style={{ gap: '8px', marginBottom: '8px' }}>
                    <span className="sidebar-module-title">{concept.short}</span>
                    <span className="sidebar-module-pct" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="progress-track" style={{ height: '3px' }}>
                    <div className="progress-fill transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
                    <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                      {concept.difficulty}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary-light)' }}>
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex-shrink-0 border-t"
        style={{ padding: '20px', borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary-light)' }}>
            Up Next
          </span>
        </div>
        {recommendation.concept ? (
          <button
            onClick={() => onSelectConcept(recommendation.concept)}
            className="sidebar-upnext w-full text-left"
            style={{ padding: '14px' }}
          >
            <div className="text-[12px] font-bold text-white" style={{ marginBottom: '6px' }}>
              {concepts[recommendation.concept]?.short}
            </div>
            <p className="text-[10px] leading-relaxed line-clamp-2 m-0" style={{ color: 'var(--color-text-muted)' }}>
              {recommendation.reason}
            </p>
          </button>
        ) : (
          <div className="sidebar-upnext" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.15)', padding: '14px' }}>
            <p className="text-[11px] font-semibold m-0" style={{ color: 'var(--color-accent-emerald)' }}>
              All modules mastered!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
