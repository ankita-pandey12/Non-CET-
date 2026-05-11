import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useStudent } from '../context/StudentContext';
import { coursesByStream, examConfig } from '../config/formConfig';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

export default function CourseExam({ onNext, onBack }) {
  const { data, updateField } = useStudent();
  const [errors, setErrors] = useState({});

  const courses = coursesByStream[data.stream] || [];
  const config = examConfig[data.course] || null;

  // When course changes, reset exam fields
  useEffect(() => {
    if (config?.type === 'fixed') {
      updateField('examType', config.fixedExam);
    } else if (config?.type === 'merit') {
      updateField('examType', 'Merit-based');
      updateField('examScore', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.course]);

  const validate = () => {
    const errs = {};
    if (!data.course) errs.course = 'Please select a course';
    if (config && config.type !== 'merit') {
      if (config.type === 'select' && !data.examType)
        errs.examType = 'Please select an exam';
      if (!data.examScore && data.examScore !== 0)
        errs.examScore = 'Please enter your score';
      else {
        const s = parseFloat(data.examScore);
        if (isNaN(s) || s < 0 || s > config.max)
          errs.examScore = `Enter a valid score (0–${config.max})`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="step-header">
        <h1 className="step-title">Course & Exam Details</h1>
        <p className="step-subtitle">Select your preferred course and enter exam details</p>
      </div>

      <div className="form-grid">
        {/* Course */}
        <div className={`form-group ${errors.course ? 'has-error' : ''}`}>
          <label className="form-label">
            <span className="label-icon">🎓</span> Preferred Course
          </label>
          <div className="select-wrap">
            <select
              className="form-select"
              value={data.course}
              onChange={(e) => {
                updateField('course', e.target.value);
                updateField('examType', '');
                updateField('examScore', '');
                setErrors({});
              }}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <span className="select-arrow">▾</span>
          </div>
          {errors.course && <span className="field-error">{errors.course}</span>}
        </div>

        {/* Dynamic Exam Fields */}
        {config && config.type === 'merit' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="merit-badge">
              <span className="merit-icon">🏅</span>
              <div>
                <strong>Merit-Based Admission</strong>
                <p>No entrance exam required. Admission is based on your 12th percentage.</p>
              </div>
            </div>
          </motion.div>
        )}

        {config && config.type !== 'merit' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="form-grid"
            style={{ gap: '26px' }}
          >
            {/* Badge */}
            <div className="info-badge">
              <span>ℹ️</span>
              <span>{config.badge}</span>
            </div>

            {/* Exam type selector (for select type) */}
            {config.type === 'select' && (
              <div className={`form-group ${errors.examType ? 'has-error' : ''}`}>
                <label className="form-label">
                  <span className="label-icon">📝</span> {config.label}
                </label>
                <div className="select-wrap">
                  <select
                    className="form-select"
                    value={data.examType}
                    onChange={(e) => {
                      updateField('examType', e.target.value);
                      setErrors((er) => ({ ...er, examType: undefined }));
                    }}
                  >
                    <option value="">Select Exam</option>
                    {config.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
                {errors.examType && <span className="field-error">{errors.examType}</span>}
              </div>
            )}

            {/* Score input */}
            <div className={`form-group ${errors.examScore ? 'has-error' : ''}`}>
              <label className="form-label">
                <span className="label-icon">📊</span> {config.scoreLabel}
              </label>
              <div className="input-wrap">
                <input
                  type="number"
                  className="form-input"
                  placeholder={config.placeholder}
                  min="0"
                  max={config.max}
                  value={data.examScore}
                  onChange={(e) => {
                    updateField('examScore', e.target.value);
                    setErrors((er) => ({ ...er, examScore: undefined }));
                  }}
                />
                <span className="input-suffix">{config.suffix}</span>
              </div>
              {errors.examScore && <span className="field-error">{errors.examScore}</span>}
            </div>
          </motion.div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onBack}>
          <FiArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Review <FiArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
