import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

export default function Login() {
  const { login, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email.trim()) return setLocalError('Please enter your email');
    if (!password) return setLocalError('Please enter your password');

    const result = await login(email.trim(), password);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className="register-page-split">
      <div className="register-saas-container">
        {/* LEFT PANEL */}
        <div className="register-card-left">
          <Link to="/" className="register-brand">
            <div className="register-brand-icon">🎓</div>
            <span className="register-brand-text">Vidyarthi Mitra</span>
          </Link>

          <div className="register-left-content">
            <h1 className="register-headline">
              Find the Right College.<br />
              Build the Right Future.
            </h1>
            <p className="register-supporting">
              Compare colleges, predict admission chances and discover career opportunities.
            </p>

            <ul className="register-features">
              <li className="register-feature-item">
                <span className="register-feature-check"><FiCheck /></span>
                Personalized Predictions
              </li>
              <li className="register-feature-item">
                <span className="register-feature-check"><FiCheck /></span>
                Detailed Cutoff Analysis
              </li>
              <li className="register-feature-item">
                <span className="register-feature-check"><FiCheck /></span>
                Expert Career Guidance
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="register-card-right">
          {displayError && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertCircle size={18} />
              <span>{displayError}</span>
            </motion.div>
          )}

          <motion.div {...fadeUp}>
            <h2 className="register-card-title">Welcome Back</h2>
            <p className="register-card-subtitle">Login to access your college predictions</p>

            <form onSubmit={handleSubmit} className="register-form-grid">
              <div className="register-form-group">
                <label className="register-form-label">
                  <FiMail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  className="register-form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  autoComplete="email"
                />
              </div>

              <div className="register-form-group">
                <label className="register-form-label">
                  <FiLock size={12} /> Password
                </label>
                <input
                  type="password"
                  className="register-form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="register-btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'} <FiArrowRight size={18} />
              </button>
            </form>

            <p className="register-card-footer">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
