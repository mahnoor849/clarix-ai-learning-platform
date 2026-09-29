import { concepts, conceptOrder } from '../data/concepts';

export default function ConceptMap({ conceptId, mastery = {} }) {
  const current = concepts[conceptId];
  if (!current) return null;

  const prereqs = current.prerequisites || [];
  const dependents = conceptOrder.filter(id => (concepts[id].prerequisites || []).includes(conceptId));

  return (
    <div className="concept-map">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Concept Map
      </div>
      <div className="concept-map-row">
        {prereqs.map(id => (
          <div key={id} className="concept-node prereq">
            <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>Prerequisite</span>
            <span className="text-[12px] font-semibold text-white">{concepts[id]?.short}</span>
            <span className="text-[10px]" style={{ color: getColor(mastery[id]) }}>{Math.round((mastery[id] || 0) * 100)}%</span>
          </div>
        ))}
        {prereqs.length > 0 && <div className="concept-arrow">→</div>}
        <div className="concept-node current">
          <span className="text-[10px] font-bold" style={{ color: 'var(--color-primary-light)' }}>Current</span>
          <span className="text-[13px] font-bold text-white">{current.short}</span>
          <span className="text-[10px]" style={{ color: getColor(mastery[conceptId]) }}>{Math.round((mastery[conceptId] || 0) * 100)}%</span>
        </div>
        {dependents.length > 0 && <div className="concept-arrow">→</div>}
        {dependents.map(id => (
          <div key={id} className="concept-node next">
            <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>Unlocks</span>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{concepts[id]?.short}</span>
            <span className="text-[10px]" style={{ color: getColor(mastery[id]) }}>{Math.round((mastery[id] || 0) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getColor(v) {
  if (v >= 0.7) return 'var(--color-accent-emerald)';
  if (v >= 0.4) return 'var(--color-accent-amber)';
  return 'var(--color-accent-rose)';
}
