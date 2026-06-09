import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiUsers, FiLogOut, FiChevronDown, FiMenu, FiX, FiSearch, FiHome } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const NavLinks = ({ mobile }) => (
    <>
      <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
        <FiHome className="nav-icon" /> Home
      </Link>
      <Link to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}>
        <FiSearch className="nav-icon" /> Search Colleges
      </Link>
      {user && user.role !== 'admin' && (
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <FiUser className="nav-icon" /> Dashboard
        </Link>
      )}
      <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
        <FiUsers className="nav-icon" /> About Us
      </Link>
      {user && user.role === 'admin' && (
        <Link to="/admin/dashboard" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
          <FiSearch className="nav-icon" /> Admin Panel
        </Link>
      )}
    </>
  );

  // Render Navbar everywhere

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        {/* Logo Section */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">CP</div>
          <span className="logo-text">CollegePredictor</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links desktop-only">
          <NavLinks />
        </div>

        {/* Right Section (Auth / Profile) */}
        <div className="navbar-actions">
          {user ? (
            <div className="profile-dropdown-container" ref={dropdownRef}>
              <button 
                className="profile-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="avatar">
                  {getInitials(user.name || user.email)}
                </div>
                <span className="user-name desktop-only">{user.name || 'User'}</span>
                <FiChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    className="profile-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user.name || 'User'}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate('/dashboard'); }}>
                      <FiUser /> Profile / Dashboard
                    </button>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="auth-buttons desktop-only">
              <Link to="/login" className="btn-login-outline">Log in</Link>
              <Link to="/register" className="btn-register-solid">Sign up</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="mobile-links">
              <NavLinks mobile />
              {!user && (
                <div className="mobile-auth">
                  <Link to="/login" className="btn-login-outline full-width">Log in</Link>
                  <Link to="/register" className="btn-register-solid full-width">Sign up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
