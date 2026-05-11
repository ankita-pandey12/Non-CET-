import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogOut, FiUser, FiBook, FiAward, FiMail, FiPhone, FiSearch, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { examConfig } from '../config/formConfig';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] } },
});

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const config = examConfig[user.course];
  const streamDisplay = user.stream + (user.subjects ? ` (${user.subjects})` : '');
  const examDisplay =
    user.examType === 'Merit-based'
      ? 'Merit-based (no exam)'
      : `${user.examType} — ${user.examScore} ${config?.suffix || ''}`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <div className="app-shell">
        {/* Top bar */}
        <motion.header className="dash-header" {...fadeUp(0)}>
          <div className="logo">
            <div className="logo-icon">🎓</div>
            <span className="logo-text">College Predictor</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <FiLogOut size={16} /> Logout
          </button>
        </motion.header>

        {/* Welcome */}
        <motion.div className="dash-welcome" {...fadeUp(0.1)}>
          <div className="dash-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="dash-name">Welcome, {user.name}! 👋</h1>
            <p className="dash-email"><FiMail size={14} /> {user.email}</p>
          </div>
        </motion.div>

        {/* Profile Cards */}
        <div className="dash-cards">
          <motion.div className="dash-card" {...fadeUp(0.2)}>
            <div className="dash-card-header">
              <FiUser size={20} />
              <h2>Personal Info</h2>
            </div>
            <div className="dash-card-grid">
              <div className="dash-item">
                <span className="dash-label">Full Name</span>
                <span className="dash-value">{user.name}</span>
              </div>
              <div className="dash-item">
                <span className="dash-label">Email</span>
                <span className="dash-value">{user.email}</span>
              </div>
              <div className="dash-item">
                <span className="dash-label">Phone</span>
                <span className="dash-value">{user.phone || '—'}</span>
              </div>
              <div className="dash-item">
                <span className="dash-label">Category</span>
                <span className="dash-value">{user.category}</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="dash-card" {...fadeUp(0.3)}>
            <div className="dash-card-header">
              <FiBook size={20} />
              <h2>Academic Details</h2>
            </div>
            <div className="dash-card-grid">
              <div className="dash-item">
                <span className="dash-label">Board</span>
                <span className="dash-value">{user.board}</span>
              </div>
              <div className="dash-item">
                <span className="dash-label">Stream</span>
                <span className="dash-value">{streamDisplay}</span>
              </div>
              <div className="dash-item">
                <span className="dash-label">12th Percentage</span>
                <span className="dash-value accent">{user.percentage}%</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="dash-card" {...fadeUp(0.4)}>
            <div className="dash-card-header">
              <FiAward size={20} />
              <h2>Course & Exam</h2>
            </div>
            <div className="dash-card-grid">
              <div className="dash-item">
                <span className="dash-label">Preferred Course</span>
                <span className="dash-value accent">{user.course}</span>
              </div>
              <div className="dash-item">
                <span className="dash-label">Entrance Exam</span>
                <span className="dash-value">{examDisplay}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Colleges CTA */}
        <motion.div className="dash-cta" {...fadeUp(0.5)}>
          <div className="dash-cta-content">
            <div className="dash-cta-icon">🔍</div>
            <div>
              <h2 className="dash-cta-title">Find Your Dream College</h2>
              <p className="dash-cta-desc">
                Search from 480+ colleges across Maharashtra — filter by city, course, and more
              </p>
            </div>
          </div>
          <Link to="/search" className="btn btn-primary btn-lg">
            <FiSearch size={18} /> Search Colleges <FiArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
