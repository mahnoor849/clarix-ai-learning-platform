export default function EducatorCard({ label, title, description, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border flex flex-col ${className}`}
      style={{
        borderColor: 'var(--color-border)',
        background: 'rgba(255,255,255,0.02)',
        padding: '32px',
        gap: '28px',
      }}
    >
      {(label || title || description) && (
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {label && <span className="section-label" style={{ marginBottom: 0 }}>{label}</span>}
          {title && <h3 className="text-lg font-bold text-white m-0 leading-tight">{title}</h3>}
          {description && (
            <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
