import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const LINKS = [
  { label: 'How it works', path: '/methodology' },
  { label: 'Research',     path: '/research-papers' },
  { label: 'Demo',         path: '/demo' },
];

const HOME = { admin: '/admin-dashboard', expert: '/expert-dashboard', user: '/user-dashboard' };

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav
      className="fixed top-0 inset-x-0 z-[1000] h-16 bg-lightbox border-b border-ink flex items-center gap-4 px-4 sm:px-6"
      aria-label="Main"
    >
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="shrink-0 w-10 h-10 flex flex-col items-start justify-center gap-[5px] px-[9px] border border-ink rounded hover:bg-ink group transition-colors"
      >
        <span className="block h-[2px] w-[20px] bg-ink group-hover:bg-print" />
        <span className="block h-[2px] w-[20px] bg-ink group-hover:bg-print" />
        <span className="block h-[2px] w-[12px] bg-ink group-hover:bg-print" />
      </button>

      <Logo size={32} />

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-7">
        {LINKS.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `text-[15px] font-semibold py-1 border-b-[3px] transition-colors ${
                isActive ? 'border-brand-500 text-ink' : 'border-transparent text-slate-400 hover:text-ink'
              }`
            }
            style={{ fontStretch: '88%' }}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <button
        onClick={() => navigate(user ? (HOME[user.role] || '/user-dashboard') : '/login')}
        className="btn-ink !py-2 !px-4 !text-[15px]"
      >
        {user ? 'Dashboard' : 'Sign in'}
      </button>
    </nav>
  );
}
