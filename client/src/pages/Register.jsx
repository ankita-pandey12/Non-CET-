import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import StepIndicator from '../components/StepIndicator';
import AcademicInfo from '../components/AcademicInfo';
import CourseExam from '../components/CourseExam';
import Review from '../components/Review';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const stepLabels = ['Account', 'Academic Info', 'Course & Exam', 'Review'];

function RegisterStepIndicator({ current }) {
  const progress = ((current - 1) / (stepLabels.length - 1)) * 100;

  return (
    <div className="stepper">
      <div className="stepper-track">
        <motion.div
          className="stepper-track-fill"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {stepLabels.map((label, i) => {
        const stepNum = i + 1;
        let cls = 'stepper-step';
        if (stepNum === current) cls += ' active';
        if (stepNum < current) cls += ' completed';
        return (
          <div className={cls} key={stepNum}>
            <motion.div
              className="stepper-dot"
              animate={stepNum === current ? { scale: 1.08 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {stepNum < current ? (
                <span className="check-icon">✓</span>
              ) : (
                <span className="step-number">{stepNum}</span>
              )}
            </motion.div>
            <span className="stepper-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Register() {
  const { register, error, clearError, loading } = useAuth();
  const { data: studentData } = useStudent();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [accountData, setAccountData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [accountErrors, setAccountErrors] = useState({});

  const handleAccountChange = (field, value) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
    setAccountErrors((prev) => ({ ...prev, [field]: undefined }));
    if (error) clearError();
  };

  const validateAccount = () => {
    const errs = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    
    if (!accountData.name.trim()) errs.name = 'Name is required';
    else if (!nameRegex.test(accountData.name.trim())) errs.name = 'Letters and spaces only';
    
    if (!accountData.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(accountData.email)) errs.email = 'Enter a valid email';
    
    if (!accountData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(accountData.phone.trim())) errs.phone = 'Enter exactly 10 digits';
    
    if (!accountData.password) errs.password = 'Password is required';
    else if (accountData.password.length < 6) errs.password = 'Min 6 characters';
    
    if (accountData.password !== accountData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setAccountErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateAccount()) return;
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirm = async () => {
    const payload = {
      name: accountData.name.trim(),
      email: accountData.email.trim().toLowerCase(),
      phone: accountData.phone.trim(),
      password: accountData.password,
      board: studentData.board,
      stream: studentData.stream,
      subjects: studentData.stream === 'Science' ? studentData.subjects : '',
      marksObtained: parseFloat(studentData.marksObtained),
      totalMarks: parseFloat(studentData.totalMarks),
      percentage: parseFloat(studentData.percentage),
      category: studentData.category,
      course: studentData.course,
      examType: studentData.examType,
      examScore: studentData.examScore ? parseFloat(studentData.examScore) : null,
    };

    const result = await register(payload);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="register-page">
      <div className="app-shell">
        <header className="app-header">
          <div className="logo">
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
              <div className="logo-icon">🎓</div>
              <span className="logo-text">College Predictor</span>
            </Link>
          </div>
          <p className="header-tagline">Create your profile in a few simple steps</p>
        </header>

        <RegisterStepIndicator current={step} />

        <main className="form-card">
          {error && (
            <motion.div
              className="auth-error"
              style={{ marginBottom: 24 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Account */}
            {step === 1 && (
              <motion.div key="account" {...fadeUp}>
                <div className="step-header">
                  <h1 className="step-title">Create Your Account</h1>
                  <p className="step-subtitle">Let's start with your basic information</p>
                </div>
                <div className="form-grid">
                  <div className={`form-group ${accountErrors.name ? 'has-error' : ''}`}>
                    <label className="form-label">👤 Full Name</label>
                    <input className="form-input" placeholder="e.g. Ankit Sharma" value={accountData.name}
                      onChange={(e) => handleAccountChange('name', e.target.value)} />
                    {accountErrors.name && <span className="field-error">{accountErrors.name}</span>}
                  </div>
                  <div className={`form-group ${accountErrors.email ? 'has-error' : ''}`}>
                    <label className="form-label">📧 Email Address</label>
                    <input type="email" className="form-input" placeholder="you@example.com" value={accountData.email}
                      onChange={(e) => handleAccountChange('email', e.target.value)} autoComplete="email" />
                    {accountErrors.email && <span className="field-error">{accountErrors.email}</span>}
                  </div>
                  <div className={`form-group ${accountErrors.phone ? 'has-error' : ''}`}>
                    <label className="form-label">📱 Phone Number</label>
                    <input type="tel" className="form-input" placeholder="e.g. 9876543210" value={accountData.phone}
                      onChange={(e) => handleAccountChange('phone', e.target.value)} />
                    {accountErrors.phone && <span className="field-error">{accountErrors.phone}</span>}
                  </div>
                  <div className={`form-group ${accountErrors.password ? 'has-error' : ''}`}>
                    <label className="form-label">🔒 Password</label>
                    <input type="password" className="form-input" placeholder="Min 6 characters" value={accountData.password}
                      onChange={(e) => handleAccountChange('password', e.target.value)} autoComplete="new-password" />
                    {accountErrors.password && <span className="field-error">{accountErrors.password}</span>}
                  </div>
                  <div className={`form-group ${accountErrors.confirmPassword ? 'has-error' : ''}`}>
                    <label className="form-label">🔒 Confirm Password</label>
                    <input type="password" className="form-input" placeholder="Re-enter password" value={accountData.confirmPassword}
                      onChange={(e) => handleAccountChange('confirmPassword', e.target.value)} autoComplete="new-password" />
                    {accountErrors.confirmPassword && <span className="field-error">{accountErrors.confirmPassword}</span>}
                  </div>
                </div>
                <div className="form-actions">
                  <Link to="/" className="btn btn-ghost"><FiArrowLeft size={18} /> Home</Link>
                  <button className="btn btn-primary" onClick={goNext}>Next <FiArrowRight size={18} /></button>
                </div>
                <div className="auth-footer" style={{ marginTop: 20 }}>
                  <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Academic Info */}
            {step === 2 && <AcademicInfo key="academic" onNext={goNext} onBack={goBack} showBack />}

            {/* Step 3: Course & Exam */}
            {step === 3 && <CourseExam key="course" onNext={goNext} onBack={goBack} />}

            {/* Step 4: Review */}
            {step === 4 && (
              <Review
                key="review"
                onBack={goBack}
                onConfirm={handleConfirm}
                accountData={accountData}
                isRegistration
                loading={loading}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
