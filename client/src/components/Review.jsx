import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useStudent } from '../context/StudentContext';
import { examConfig } from '../config/formConfig';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

export default function Review({ onBack, onConfirm, accountData, isRegistration, loading }) {
  const { data } = useStudent();
  const config = examConfig[data.course];
  const streamDisplay = data.stream + (data.subjects ? ` (${data.subjects})` : '');
  const examDisplay =
    data.examType === 'Merit-based'
      ? 'Merit-based (no exam)'
      : `${data.examType} — ${data.examScore} ${config?.suffix || ''}`;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="step-header">
        <h1 className="step-title">{isRegistration ? 'Review & Register' : 'Review Your Profile'}</h1>
        <p className="step-subtitle">
          {isRegistration
            ? 'Confirm your details to create your account'
            : 'Confirm your details before we find the best colleges'}
        </p>
      </div>

      <div>
        {/* Account Info (registration only) */}
        {isRegistration && accountData && (
          <div className="review-block">
            <div className="review-block-title">👤 Account</div>
            <div className="review-grid">
              <div className="review-item">
                <span className="review-label">Name</span>
                <span className="review-value">{accountData.name}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Email</span>
                <span className="review-value">{accountData.email}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Phone</span>
                <span className="review-value">{accountData.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Academic Info */}
        <div className="review-block">
          <div className="review-block-title">📚 Academic Information</div>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Board</span>
              <span className="review-value">{data.board}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Stream</span>
              <span className="review-value">{streamDisplay}</span>
            </div>
            <div className="review-item">
              <span className="review-label">12th Percentage</span>
              <span className="review-value accent">{data.percentage}%</span>
            </div>
            <div className="review-item">
              <span className="review-label">Category</span>
              <span className="review-value">{data.category}</span>
            </div>
          </div>
        </div>

        {/* Course & Exam */}
        <div className="review-block">
          <div className="review-block-title">🎓 Course & Exam</div>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Preferred Course</span>
              <span className="review-value accent">{data.course}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Entrance Exam</span>
              <span className="review-value">{examDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onBack}>
          <FiArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-confirm" onClick={onConfirm} disabled={loading}>
          <FiCheck size={18} />
          {loading
            ? 'Saving...'
            : isRegistration
              ? 'Create Account'
              : 'Confirm & Continue'}
        </button>
      </div>
    </motion.div>
  );
}
