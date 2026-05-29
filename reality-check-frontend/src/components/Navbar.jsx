import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo/logo-removebg.png';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 w-full z-50 group">
      
      {/* Hover trigger area */}
      <div className="h-6 w-full" />

      {/* Navbar (hidden until hover) */}
      <nav className="
        opacity-0 -translate-y-10
        group-hover:opacity-100 group-hover:translate-y-0
        transition-all duration-300 ease-out
        glass border-b border-cyan-500/20
      ">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">

          {/* Logo + Title */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <img
              src={logo}
              alt="Reality Check Logo"
              className="w-14 h-14 object-contain"
            />

            <span className="text-4xl font-bold tracking-tighter text-white">
              REALITY<span className="text-cyan-400">CHECK</span>
            </span>
          </button>

          {/* Methodology */}
          <button
            onClick={() => navigate('/methodology')}
            className="text-2xl font-semibold text-slate-300 hover:text-cyan-400 transition-colors tracking-wide"
          >
            Methodology
          </button>

        </div>
      </nav>
    </div>
  );
}