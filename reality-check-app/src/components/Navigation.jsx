import { useState } from 'react';
import { Menu, Shield, X, ChevronDown } from 'lucide-react';
import './Navigation.css';

const Navigation = ({ currentPage, setCurrentPage, toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainPages = [
    { id: 'login', label: 'Sign In', icon: 'login' },
    { id: 'user-signup', label: 'Register', icon: 'user-plus' },
    { id: 'expert-apply', label: 'Expert Apply', icon: 'badge-check', highlight: true },
    { id: 'expert-dashboard', label: 'Expert', icon: 'bar-chart' }
  ];

  const dropdownPages = [
    { id: 'landing', label: 'Home', icon: 'home' },
    { id: 'demo', label: 'Live Demo', icon: 'play-circle' },
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'scan', label: 'Scan Media', icon: 'scan' },
    { id: 'results', label: 'Results', icon: 'file-text' },
    { id: 'flow', label: 'How It Works', icon: 'workflow' }
  ];

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <nav className="navbar">
        {/* Brand/Logo Section */}
        <div className="nav-brand">
          <Shield className="brand-icon" size={28} />
          <div className="brand-content">
            <span className="brand-text">RealityCheck</span>
            <span className="brand-tagline">Verify Reality</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {mainPages.map((page) => (
            <button
              key={page.id}
              onClick={() => handlePageChange(page.id)}
              className={`nav-link ${page.highlight ? 'highlight' : ''} ${currentPage === page.id ? 'active' : ''}`}
            >
              {page.label}
              {page.highlight && <div className="pulse-dot" />}
            </button>
          ))}

          {/* Desktop Dropdown */}
          <div className="dropdown-container">
            <button
              className="nav-link dropdown-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>More</span>
              <ChevronDown size={16} className={`dropdown-arrow ${showDropdown ? 'rotate' : ''}`} />
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                {dropdownPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageChange(page.id)}
                    className={`dropdown-item ${currentPage === page.id ? 'active' : ''}`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu & Sidebar Toggle */}
        <div className="nav-mobile">
          {/* Sidebar Toggle Button */}
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
            // In Navigation.jsx, add this temporarily:
            <button onClick={toggleSidebar} style={{
              background: 'red',
              color: 'white',
              padding: '10px',
              margin: '10px'
            }}>
              TEST TOGGLE SIDEBAR
            </button>
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <span className="menu-dots">⋯</span>}
          </button>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="mobile-dropdown">
              {[...mainPages, ...dropdownPages].map((page) => (
                <button
                  key={page.id}
                  onClick={() => handlePageChange(page.id)}
                  className={`mobile-nav-item ${currentPage === page.id ? 'active' : ''} ${page.highlight ? 'highlight' : ''}`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;