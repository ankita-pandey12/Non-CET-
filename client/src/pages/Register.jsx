import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiArrowRight, FiArrowLeft, FiCheck, FiX, FiAward, FiBook } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { coursesByStream, examConfig } from '../config/formConfig';

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
};

export default function Register() {
  const { register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  // Step 1 states
  const [accountData, setAccountData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [accountErrors, setAccountErrors] = useState({});

  // OTP Verification states (Step 2)
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Education Details states (Step 3)
  const [studentData, setStudentData] = useState({
    board: '',
    stream: '',
    subjects: '',
    marksObtained: '',
    totalMarks: '',
    percentage: '',
    category: '',
    course: '',
    examType: '',
    examScore: ''
  });
  const [eduErrors, setEduErrors] = useState({});
  const [adminCourses, setAdminCourses] = useState([]);

  useEffect(() => {
    // Fetch admin inputted courses
    axios.get('http://127.0.0.1:5000/api/courses')
      .then(res => {
        if (res.data.success) {
          setAdminCourses(res.data.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleAccountChange = (field, value) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
    setAccountErrors((prev) => ({ ...prev, [field]: undefined }));
    if (error) clearError();
  };

  const validateAccount = () => {
    const errs = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!accountData.name.trim()) {
      errs.name = 'Name is required';
    } else if (!nameRegex.test(accountData.name.trim())) {
      errs.name = 'Letters and spaces only';
    }

    if (!accountData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(accountData.email)) {
      errs.email = 'Enter a valid email';
    }

    if (!accountData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(accountData.phone.trim())) {
      errs.phone = 'Enter exactly 10 digits';
    }

    const hasLetter = /[a-zA-Z]/.test(accountData.password);
    const hasNumber = /[0-9]/.test(accountData.password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(accountData.password);

    if (!accountData.password) {
      errs.password = 'Password is required';
    } else if (accountData.password.length < 7) {
      errs.password = 'Password must be at least 7 characters';
    } else if (!hasLetter) {
      errs.password = 'Password must contain at least one letter';
    } else if (!hasNumber) {
      errs.password = 'Password must contain at least one number';
    } else if (!hasSpecial) {
      errs.password = 'Password must contain at least one special character';
    }

    if (accountData.password !== accountData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setAccountErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateAccount()) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/send-otp', {
        email: accountData.email.trim().toLowerCase()
      });
      if (response.data.success) {
        setIsOtpSent(true);
        setCountdown(30);
      } else {
        setOtpError(response.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Error sending OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 4) {
      setOtpError('Please enter a valid OTP code');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/verify-otp', {
        email: accountData.email.trim().toLowerCase(),
        code: otp.trim()
      });
      if (response.data.success) {
        setIsOtpVerified(true);
      } else {
        setOtpError(response.data.message || 'Incorrect OTP code. Please try again.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Education Details changes
  const handleEduChange = (field, value) => {
    setStudentData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto compute percentage if marks are updated
      if (field === 'marksObtained' || field === 'totalMarks') {
        const mo = field === 'marksObtained' ? parseFloat(value) : parseFloat(prev.marksObtained);
        const tm = field === 'totalMarks' ? parseFloat(value) : parseFloat(prev.totalMarks);
        if (!isNaN(mo) && !isNaN(tm) && tm > 0 && mo >= 0 && mo <= tm) {
          updated.percentage = ((mo / tm) * 100).toFixed(2);
        } else {
          updated.percentage = '';
        }
      }
      return updated;
    });
    setEduErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleStreamChange = (streamVal) => {
    setStudentData((prev) => ({
      ...prev,
      stream: streamVal,
      course: '',
      examType: '',
      examScore: ''
    }));
  };

  const handleCourseChange = (courseVal) => {
    if (!courseVal) {
      setStudentData((prev) => ({
        ...prev,
        course: '',
        examType: '',
        examScore: ''
      }));
      return;
    }
    const config = examConfig[courseVal];
    let examVal = 'Merit-based';
    if (config?.type === 'fixed') examVal = config.fixedExam;
    else if (config?.type === 'select') examVal = config.options[0].value;

    setStudentData((prev) => ({
      ...prev,
      course: courseVal,
      examType: examVal,
      examScore: ''
    }));
  };

  const validateEdu = () => {
    const errs = {};
    if (!studentData.board) errs.board = 'Required';
    if (!studentData.category) errs.category = 'Required';
    if (!studentData.stream) errs.stream = 'Required';
    if (!studentData.course) errs.course = 'Required';
    if (studentData.stream === 'Science' && !studentData.subjects) errs.subjects = 'Required';
    if (!studentData.marksObtained) errs.marksObtained = 'Required';
    if (!studentData.totalMarks) errs.totalMarks = 'Required';
    
    const mo = parseFloat(studentData.marksObtained);
    const tm = parseFloat(studentData.totalMarks);
    if (!isNaN(mo) && !isNaN(tm) && mo > tm) errs.marksObtained = 'Cannot exceed total marks';

    const currentConfig = examConfig[studentData.course];
    if (currentConfig && currentConfig.type !== 'merit') {
      if (!studentData.examScore) {
        errs.examScore = 'Required';
      } else {
        const score = parseFloat(studentData.examScore);
        if (isNaN(score) || score < 0 || score > currentConfig.max) {
          errs.examScore = `Must be between 0 and ${currentConfig.max}`;
        }
      }
    }

    setEduErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async () => {
    if (!validateEdu()) return;

    const payload = {
      name: accountData.name.trim(),
      email: accountData.email.trim().toLowerCase(),
      phone: accountData.phone.trim(),
      password: accountData.password,
      board: studentData.board,
      stream: studentData.stream,
      subjects: studentData.stream === 'Science' ? studentData.subjects : '',
      percentage: parseFloat(studentData.percentage),
      marksObtained: parseFloat(studentData.marksObtained),
      totalMarks: parseFloat(studentData.totalMarks),
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

  // Try to find the exact config, or match by partial name if available
  let config = examConfig[studentData.course];
  if (!config) {
    // Fallback search to match config by partial string (e.g. "B.Tech" matches "B.Tech / B.E.")
    const matchingKey = Object.keys(examConfig).find(k => k.includes(studentData.course) || studentData.course.includes(k));
    if (matchingKey) config = examConfig[matchingKey];
  }
  const currentConfig = config;

  // Stream to category mapping for filtering admin courses
  const streamCategories = {
    Science: ['Engineering & Technology', 'Medical & Health Sciences', 'Pharmacy & Healthcare', 'Science', 'Computer Applications & IT', 'Agriculture & Allied Sciences', 'Architecture & Planning'],
    Commerce: ['Commerce', 'Management & Business', 'Computer Applications & IT'],
    Arts: ['Law', 'Arts & Humanities', 'Management & Business']
  };

  const filteredAdminCourses = adminCourses.filter(c => 
    studentData.stream && streamCategories[studentData.stream]?.includes(c.category)
  );

  // Show filtered admin courses, or default to static stream courses if API fails
  const availableCourses = adminCourses.length > 0 
    ? filteredAdminCourses.map(c => ({ value: c.name, label: c.name }))
    : (coursesByStream[studentData.stream] || []);

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
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isOtpSent && !isOtpVerified && (
              <motion.div key="register-form" {...fadeUp}>
                <h2 className="register-card-title">Create Account</h2>
                <p className="register-card-subtitle">Get started with your free predictor account</p>

                <div className="register-form-grid">
                  <div className={`register-form-group ${accountErrors.name ? 'has-error' : ''}`}>
                    <label className="register-form-label">Full Name</label>
                    <input
                      type="text"
                      className="register-form-input"
                      placeholder="e.g. Ankit Sharma"
                      value={accountData.name}
                      onChange={(e) => handleAccountChange('name', e.target.value)}
                    />
                    {accountErrors.name && <span className="field-error">{accountErrors.name}</span>}
                  </div>

                  <div className={`register-form-group ${accountErrors.email ? 'has-error' : ''}`}>
                    <label className="register-form-label">Email Address</label>
                    <input
                      type="email"
                      className="register-form-input"
                      placeholder="you@example.com"
                      value={accountData.email}
                      onChange={(e) => handleAccountChange('email', e.target.value)}
                    />
                    {accountErrors.email && <span className="field-error">{accountErrors.email}</span>}
                  </div>

                  <div className={`register-form-group ${accountErrors.phone ? 'has-error' : ''}`}>
                    <label className="register-form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="register-form-input"
                      placeholder="10-digit mobile number"
                      value={accountData.phone}
                      onChange={(e) => handleAccountChange('phone', e.target.value)}
                    />
                    {accountErrors.phone && <span className="field-error">{accountErrors.phone}</span>}
                  </div>

                  <div className={`register-form-group ${accountErrors.password ? 'has-error' : ''}`}>
                    <label className="register-form-label">Password</label>
                    <input
                      type="password"
                      className="register-form-input"
                      placeholder="Min 7 characters, letter, number & symbol"
                      value={accountData.password}
                      onChange={(e) => handleAccountChange('password', e.target.value)}
                    />
                    {accountErrors.password && <span className="field-error">{accountErrors.password}</span>}

                    {accountData.password.length > 0 && (
                      <div className="password-requirements">
                        <div className={`password-requirement-item ${accountData.password.length >= 7 ? 'valid' : ''}`}>
                          {accountData.password.length >= 7 ? <FiCheck /> : <FiX />} Min 7 characters
                        </div>
                        <div className={`password-requirement-item ${/[a-zA-Z]/.test(accountData.password) ? 'valid' : ''}`}>
                          {/[a-zA-Z]/.test(accountData.password) ? <FiCheck /> : <FiX />} Contains a letter
                        </div>
                        <div className={`password-requirement-item ${/[0-9]/.test(accountData.password) ? 'valid' : ''}`}>
                          {/[0-9]/.test(accountData.password) ? <FiCheck /> : <FiX />} Contains a number
                        </div>
                        <div className={`password-requirement-item ${/[^a-zA-Z0-9]/.test(accountData.password) ? 'valid' : ''}`}>
                          {/[^a-zA-Z0-9]/.test(accountData.password) ? <FiCheck /> : <FiX />} Contains a symbol/special character
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`register-form-group ${accountErrors.confirmPassword ? 'has-error' : ''}`}>
                    <label className="register-form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="register-form-input"
                      placeholder="Re-enter password"
                      value={accountData.confirmPassword}
                      onChange={(e) => handleAccountChange('confirmPassword', e.target.value)}
                    />
                    {accountErrors.confirmPassword && <span className="field-error">{accountErrors.confirmPassword}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  className="register-btn-primary"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Sending...' : 'Create Account'} <FiArrowRight size={18} />
                </button>

                <p className="register-card-footer">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </motion.div>
            )}

            {isOtpSent && !isOtpVerified && (
              <motion.div key="otp-form" {...fadeUp}>
                <h2 className="register-card-title">Verify Email</h2>
                <p className="register-card-subtitle">
                  We've sent a 6-digit verification code to <strong>{accountData.email}</strong>
                </p>

                <div className="register-form-grid">
                  <div className={`register-form-group ${otpError ? 'has-error' : ''}`}>
                    <label className="register-form-label">Verification Code</label>
                    <input
                      type="text"
                      className="register-form-input"
                      placeholder="Enter code"
                      value={otp}
                      maxLength={6}
                      style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setOtpError('');
                      }}
                    />
                    {otpError && <span className="field-error" style={{ textAlign: 'center', display: 'block' }}>{otpError}</span>}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    {countdown > 0 ? (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Resend code in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--accent-orange)', fontWeight: '600' }}
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                      >
                        {otpLoading ? 'Sending...' : 'Resend Code'}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => setIsOtpSent(false)}
                    disabled={otpLoading}
                  >
                    <FiArrowLeft /> Edit
                  </button>
                  <button
                    type="button"
                    className="register-btn-primary"
                    style={{ flex: 2, marginTop: 0 }}
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify & Proceed'} <FiArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {isOtpVerified && (
              <motion.div key="edu-form" {...fadeUp}>
                <h2 className="register-card-title">Academic Details</h2>
                <p className="register-card-subtitle">Fill in your academic profile to enable predictions</p>

                <div className="register-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                  <div className={`register-form-group ${eduErrors.board ? 'has-error' : ''}`} style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">Board</label>
                    <select
                      className="register-form-input"
                      style={{ cursor: 'pointer' }}
                      value={studentData.board}
                      onChange={(e) => handleEduChange('board', e.target.value)}
                    >
                      <option value="">Select Board</option>
                      <option value="Maharashtra State Board">Maharashtra State Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Karnataka State Board">Karnataka State Board</option>
                      <option value="Gujarat State Board">Gujarat State Board</option>
                      <option value="Goa State Board">Goa State Board</option>
                      <option value="Madhya Pradesh State Board">Madhya Pradesh State Board</option>
                      <option value="Rajasthan State Board">Rajasthan State Board</option>
                      <option value="Other State Board">Other State Board</option>
                    </select>
                    {eduErrors.board && <span className="field-error">{eduErrors.board}</span>}
                  </div>

                  <div className={`register-form-group ${eduErrors.category ? 'has-error' : ''}`} style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">Category</label>
                    <select
                      className="register-form-input"
                      style={{ cursor: 'pointer' }}
                      value={studentData.category}
                      onChange={(e) => handleEduChange('category', e.target.value)}
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                      <option value="NT">NT</option>
                      <option value="VJ/DT">VJ/DT</option>
                    </select>
                    {eduErrors.category && <span className="field-error">{eduErrors.category}</span>}
                  </div>

                  <div className={`register-form-group ${eduErrors.stream ? 'has-error' : ''}`} style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">Stream</label>
                    <select
                      className="register-form-input"
                      style={{ cursor: 'pointer' }}
                      value={studentData.stream}
                      onChange={(e) => handleStreamChange(e.target.value)}
                    >
                      <option value="">Select Stream</option>
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                    </select>
                    {eduErrors.stream && <span className="field-error">{eduErrors.stream}</span>}
                  </div>

                  <div className={`register-form-group ${eduErrors.course ? 'has-error' : ''}`} style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">Preferred Course</label>
                    <select
                      className="register-form-input"
                      style={{ cursor: 'pointer' }}
                      value={studentData.course}
                      disabled={!studentData.stream}
                      onChange={(e) => handleCourseChange(e.target.value)}
                    >
                      <option value="">Select Course</option>
                      {availableCourses.map((c) => (
                        <option key={c.value} value={c.value}>{c.value}</option>
                      ))}
                    </select>
                    {eduErrors.course && <span className="field-error">{eduErrors.course}</span>}
                  </div>

                  <div className="register-form-group" style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">Entrance Exam</label>
                    {currentConfig && currentConfig.type === 'select' ? (
                      <select
                        className="register-form-input"
                        value={studentData.examType}
                        onChange={(e) => handleEduChange('examType', e.target.value)}
                      >
                        {currentConfig.options.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="register-form-input"
                        value={currentConfig && currentConfig.type === 'fixed' ? currentConfig.fixedExam : 'Merit-based'}
                        disabled
                        style={{ opacity: 0.7 }}
                      />
                    )}
                  </div>

                  <div className="register-form-group" style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">
                      {currentConfig && currentConfig.type !== 'merit' ? currentConfig.scoreLabel : 'Exam Score'}
                    </label>
                    <input
                      type="number"
                      className="register-form-input"
                      placeholder={currentConfig && currentConfig.type !== 'merit' ? currentConfig.placeholder : 'N/A'}
                      value={studentData.examScore}
                      disabled={!currentConfig || currentConfig.type === 'merit'}
                      onChange={(e) => handleEduChange('examScore', e.target.value)}
                    />
                    {eduErrors.examScore && <span className="field-error">{eduErrors.examScore}</span>}
                  </div>

                  {studentData.stream === 'Science' && (
                    <div className={`register-form-group ${eduErrors.subjects ? 'has-error' : ''}`} style={{ gridColumn: 'span 2' }}>
                      <label className="register-form-label">Subjects Group</label>
                      <select
                        className="register-form-input"
                        value={studentData.subjects}
                        onChange={(e) => handleEduChange('subjects', e.target.value)}
                      >
                        <option value="">Select Subjects</option>
                        <option value="PCM">PCM (Physics, Chemistry, Maths)</option>
                        <option value="PCB">PCB (Physics, Chemistry, Biology)</option>
                        <option value="PCMB">PCMB (All Sciences)</option>
                      </select>
                      {eduErrors.subjects && <span className="field-error">{eduErrors.subjects}</span>}
                    </div>
                  )}

                  <div className={`register-form-group ${eduErrors.marksObtained ? 'has-error' : ''}`} style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">Marks Obtained</label>
                    <input
                      type="number"
                      className="register-form-input"
                      placeholder="e.g. 520"
                      value={studentData.marksObtained}
                      onChange={(e) => handleEduChange('marksObtained', e.target.value)}
                    />
                    {eduErrors.marksObtained && <span className="field-error">{eduErrors.marksObtained}</span>}
                  </div>

                  <div className={`register-form-group ${eduErrors.totalMarks ? 'has-error' : ''}`} style={{ gridColumn: 'span 1' }}>
                    <label className="register-form-label">Total Marks</label>
                    <input
                      type="number"
                      className="register-form-input"
                      placeholder="e.g. 600"
                      value={studentData.totalMarks}
                      onChange={(e) => handleEduChange('totalMarks', e.target.value)}
                    />
                    {eduErrors.totalMarks && <span className="field-error">{eduErrors.totalMarks}</span>}
                  </div>

                  {studentData.percentage && (
                    <div className="register-form-group" style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-orange)' }}>
                        Calculated 12th Percentage: {studentData.percentage}%
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="register-btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={handleRegisterSubmit}
                  disabled={loading}
                >
                  {loading ? 'Completing Registration...' : 'Complete Registration'} <FiArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
