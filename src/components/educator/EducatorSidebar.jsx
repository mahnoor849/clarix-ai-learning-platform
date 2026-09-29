const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
  { id: 'students', label: 'Students', icon: '◎' },
  { id: 'classes', label: 'Classes', icon: '▣' },
  { id: 'assignments', label: 'Assignments', icon: '☰' },
  { id: 'assessments', label: 'Assessments', icon: '✎' },
  { id: 'reports', label: 'Reports', icon: '▤' },
  { id: 'insights', label: 'AI Insights', icon: '✦' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function EducatorSidebar({ activeView, onNavigate, alertCount = 0 }) {
  return (
    <aside
      className="flex flex-col min-h-0 overflow-hidden rounded-[14px] border bg-[#0A0A0A]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div
        className="flex items-center border-b flex-shrink-0"
        style={{ gap: '16px', padding: '28px 22px 24px', borderColor: 'var(--color-border)' }}
      >
        <div
          className="educator-brand-icon flex-shrink-0 flex items-center justify-center font-extrabold text-white"
          style={{ width: '44px', height: '44px', borderRadius: '12px', fontSize: '15px' }}
        >
          C
        </div>
        <div className="min-w-0">
          <div className="text-base font-bold text-white leading-tight">Clarix</div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)', marginTop: '6px' }}
          >
            Educator Portal
          </div>
        </div>
      </div>

      <nav
        className="flex-1 min-h-0 overflow-y-auto flex flex-col"
        style={{ padding: '20px 16px', gap: '10px' }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center w-full rounded-xl text-left text-[13px] font-semibold transition-all border"
              style={{
                gap: '12px',
                padding: '14px 16px',
                color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                background: isActive ? 'rgba(94,106,210,0.12)' : 'transparent',
                borderColor: isActive ? 'rgba(94,106,210,0.25)' : 'transparent',
              }}
            >
              <span className="text-[11px] opacity-80">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.id === 'insights' && alertCount > 0 && (
                <span
                  className="text-[10px] font-bold rounded-full"
                  style={{ padding: '2px 8px', background: 'rgba(251,113,133,0.15)', color: 'var(--color-accent-rose)' }}
                >
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        className="flex-shrink-0 border-t"
        style={{ padding: '20px 22px', borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex items-center text-[10px] font-bold uppercase tracking-wider"
          style={{ gap: '10px', color: 'var(--color-accent-emerald)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-emerald)] shadow-[0_0_8px_var(--color-accent-emerald)]" />
          Classroom Live
        </div>
      </div>
    </aside>
  );
}
