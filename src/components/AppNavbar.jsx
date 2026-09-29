import { Link, useNavigate } from 'react-router-dom';

export default function AppNavbar({ showLinks = true, rightAction }) {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b w-full"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.85)', borderColor: 'var(--color-border)' }}>
      <div className="page-container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-[#1E1E1E] border"
            style={{ borderColor: 'var(--color-border)' }}>C</div>
          <span className="font-bold text-base md:text-lg text-white tracking-tight">Clarix</span>
        </Link>

        <div className="flex items-center gap-3">
          {showLinks && (
            <>
              <Link to="/learner" className="text-[13px] font-medium transition-colors hover:text-white hidden sm:block"
                style={{ color: 'var(--color-text-secondary)' }}>Learner Portal</Link>
              <Link to="/educator" className="text-[13px] font-medium transition-colors hover:text-white hidden sm:block"
                style={{ color: 'var(--color-text-secondary)' }}>Educator</Link>
            </>
          )}
          {rightAction || (
            <button onClick={() => navigate('/learner')} className="btn-primary text-[13px] py-2 px-4 rounded-lg">
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
