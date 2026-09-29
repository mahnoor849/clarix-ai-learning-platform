import EducatorCard from './EducatorCard';

export default function ClassHeatmap({ data, onSelectConcept, selectedConceptId }) {
  return (
    <EducatorCard
      label="Classroom Heatmap"
      title="Concept Mastery Overview"
      description="Click a concept to open the AI Intervention Center"
    >
      <div className="flex flex-col" style={{ gap: '14px' }}>
        {data.map(row => {
          const color = row.avg >= 0.7 ? 'var(--color-accent-emerald)' : row.avg >= 0.4 ? 'var(--color-accent-amber)' : 'var(--color-accent-rose)';
          return (
            <button
              key={row.id}
              onClick={() => onSelectConcept?.(row.id)}
              className="grid items-center w-full rounded-xl border text-left transition-all"
              style={{
                gridTemplateColumns: 'minmax(120px, 140px) 1fr 52px',
                gap: '20px',
                padding: '16px 18px',
                borderColor: selectedConceptId === row.id ? 'rgba(94,106,210,0.25)' : 'var(--color-border)',
                background: selectedConceptId === row.id ? 'rgba(94,106,210,0.06)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <span className="text-[13px] font-semibold text-white">{row.short}</span>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${row.pct}%`, backgroundColor: color }} />
              </div>
              <span className="text-[13px] font-bold text-right" style={{ color }}>{row.pct}%</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap text-[10px]" style={{ gap: '20px', color: 'var(--color-text-muted)', paddingTop: '8px' }}>
        <span className="flex items-center gap-2"><i className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--color-accent-emerald)' }} /> Healthy (≥70%)</span>
        <span className="flex items-center gap-2"><i className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--color-accent-amber)' }} /> Attention (40–69%)</span>
        <span className="flex items-center gap-2"><i className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--color-accent-rose)' }} /> Critical (&lt;40%)</span>
      </div>
    </EducatorCard>
  );
}
