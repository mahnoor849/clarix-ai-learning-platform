import { concepts, conceptOrder } from '../../data/concepts';
import { getInterventionPlan } from '../../utils/educatorAnalytics';
import EducatorCard from './EducatorCard';

export default function InterventionCenter({ profiles, selectedConceptId, onSelectConcept }) {
  const list = Object.values(profiles);
  const weakest = conceptOrder.reduce((minId, id) => {
    const avgId = list.reduce((s, p) => s + (p.mastery[id] || 0), 0) / (list.length || 1);
    const avgMin = list.reduce((s, p) => s + (p.mastery[minId] || 0), 0) / (list.length || 1);
    return avgId < avgMin ? id : minId;
  }, conceptOrder[0]);

  const activeId = selectedConceptId || weakest;
  const plan = getInterventionPlan(activeId, profiles);

  return (
    <EducatorCard label="AI Intervention Center" title="Intervention Planning">
      <div className="flex flex-wrap" style={{ gap: '10px' }}>
        {conceptOrder.map(id => {
          const isActive = activeId === id;
          return (
            <button
              key={id}
              onClick={() => onSelectConcept(id)}
              className="text-[10px] font-semibold rounded-lg border transition-all"
              style={{
                padding: '8px 12px',
                borderColor: isActive ? 'rgba(94,106,210,0.3)' : 'var(--color-border)',
                background: isActive ? 'rgba(94,106,210,0.15)' : 'rgba(255,255,255,0.02)',
                color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
              }}
            >
              {concepts[id].short}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col" style={{ gap: '24px' }}>
        <h4 className="text-base font-bold text-white m-0">{plan.concept.name}</h4>

        <div className="flex flex-col" style={{ gap: '12px' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Observed Issues</span>
          <ul className="m-0 p-0 list-none flex flex-col" style={{ gap: '10px', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
            {plan.issues.map((issue, i) => (
              <li key={i}>• {issue}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col" style={{ gap: '12px' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Suggested Actions</span>
          <ul className="m-0 p-0 list-none flex flex-col" style={{ gap: '10px', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-accent-emerald)' }}>
            {plan.actions.map((action, i) => (
              <li key={i}>✓ {action}</li>
            ))}
          </ul>
        </div>
      </div>
    </EducatorCard>
  );
}
