import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBookOpen, FiTarget, FiAward, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } },
});

const features = [
  { icon: <FiBookOpen size={28} />, title: 'Smart Course Matching', desc: 'Dynamic course suggestions based on your stream and academic background.' },
  { icon: <FiTarget size={28} />, title: 'Exam-Aware Predictions', desc: 'Enter your MHT-CET, JEE, or NEET scores for precise college matching.' },
  { icon: <FiAward size={28} />, title: 'Category-Based Results', desc: 'Accurate cutoff analysis factoring in your reservation category.' },
  { icon: <FiUsers size={28} />, title: 'Personalized Profile', desc: 'Save your academic profile and access predictions anytime.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <motion.div className="hero-badge" {...fadeUp(0)}>
          <span className="hero-badge-dot" />
          2026 Admissions Open
        </motion.div>

        <motion.h1 className="hero-title" {...fadeUp(0.1)}>
          Find Your <span className="gradient-text">Perfect College</span> with AI-Powered Predictions
        </motion.h1>

        <motion.p className="hero-subtitle" {...fadeUp(0.2)}>
          Enter your academic details, exam scores, and preferences — we'll match you
          with the best colleges across Maharashtra and India.
        </motion.p>

        <motion.div className="hero-actions" {...fadeUp(0.3)}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard <FiArrowRight size={20} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free <FiArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                Already have an account? Login
              </Link>
            </>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div className="hero-stats" {...fadeUp(0.4)}>
          <div className="stat">
            <span className="stat-value">500+</span>
            <span className="stat-label">Colleges</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">50K+</span>
            <span className="stat-label">Students</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">95%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="features-section">
        <motion.h2 className="section-title" {...fadeUp(0)}>
          Why Students Choose Us
        </motion.h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div className="feature-card" key={i} {...fadeUp(i * 0.1)}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section className="cta-section" {...fadeUp(0)}>
        <div className="cta-card">
          <h2>Ready to find your dream college?</h2>
          <p>Join thousands of students who've already discovered their perfect match.</p>
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-confirm btn-lg">
            {user ? 'View Dashboard' : 'Start Your Journey'} <FiArrowRight size={20} />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
