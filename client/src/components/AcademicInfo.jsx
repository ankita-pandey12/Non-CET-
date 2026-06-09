import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useStudent } from '../context/StudentContext';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

export default function AcademicInfo({ onNext, onBack, showBack }) {
  const { data, updateField } = useStudent();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!data.board) errs.board = 'Please select your board';
    if (!data.stream) errs.stream = 'Please select your stream';
    if (data.stream === 'Science' && !data.subjects)
      errs.subjects = 'Please select subject combination';
    if (!data.marksObtained && data.marksObtained !== 0 && data.marksObtained !== '0') errs.marksObtained = 'Required';
    if (!data.totalMarks) errs.totalMarks = 'Required';
    
    if (data.totalMarks && data.marksObtained) {
      const mo = parseFloat(data.marksObtained);
      const tm = parseFloat(data.totalMarks);
      if (isNaN(mo) || isNaN(tm)) errs.marksObtained = 'Invalid numbers';
      else if (mo < 0) errs.marksObtained = 'Cannot be negative';
      else if (tm <= 0) errs.totalMarks = 'Must be > 0';
      else if (mo > tm) errs.marksObtained = 'Marks obtained cannot exceed total marks';
    }
    if (!data.category) errs.category = 'Please select your category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const handleStreamChange = (val) => {
    updateField('stream', val);
    if (val !== 'Science') updateField('subjects', '');
    updateField('course', '');
    updateField('examType', '');
    updateField('examScore', '');
    setErrors((e) => ({ ...e, stream: undefined }));
  };

  const handleMarksChange = (field, val) => {
    updateField(field, val);
    setErrors((e) => ({ ...e, [field]: undefined }));
    
    const mo = field === 'marksObtained' ? parseFloat(val) : parseFloat(data.marksObtained);
    const tm = field === 'totalMarks' ? parseFloat(val) : parseFloat(data.totalMarks);
    
    if (!isNaN(mo) && !isNaN(tm) && tm > 0 && mo >= 0 && mo <= tm) {
      const p = ((mo / tm) * 100).toFixed(2);
      updateField('percentage', p);
    } else {
      updateField('percentage', '');
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="step-header">
        <h1 className="step-title">Academic Information</h1>
        <p className="step-subtitle">Tell us about your 12th standard academics</p>
      </div>

      <div className="form-grid">
        {/* Board */}
        <div className={`form-group ${errors.board ? 'has-error' : ''}`}>
          <label className="form-label">
            <span className="label-icon">📚</span> Board
          </label>
          <div className="select-wrap">
            <select
              className="form-select"
              value={data.board}
              onChange={(e) => {
                updateField('board', e.target.value);
                setErrors((er) => ({ ...er, board: undefined }));
              }}
            >
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="Maharashtra State Board">Maharashtra State Board</option>
              <option value="Other State Board">Other State Board</option>
            </select>
            <span className="select-arrow">▾</span>
          </div>
          {errors.board && <span className="field-error">{errors.board}</span>}
        </div>

        {/* Stream */}
        <div className={`form-group ${errors.stream ? 'has-error' : ''}`}>
          <label className="form-label">
            <span className="label-icon">🔬</span> Stream
          </label>
          <div className="radio-group">
            {[
              { value: 'Science', icon: '🔬', label: 'Science' },
              { value: 'Commerce', icon: '📊', label: 'Commerce' },
              { value: 'Arts', icon: '🎨', label: 'Arts' },
            ].map((s) => (
              <label className="radio-card" key={s.value}>
                <input
                  type="radio"
                  name="stream"
                  value={s.value}
                  checked={data.stream === s.value}
                  onChange={() => handleStreamChange(s.value)}
                />
                <div className="radio-card-body">
                  <div className="radio-indicator" />
                  <span>{s.icon} {s.label}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.stream && <span className="field-error">{errors.stream}</span>}
        </div>

        {/* Subjects (Science only) */}
        {data.stream === 'Science' && (
          <motion.div
            className={`form-group ${errors.subjects ? 'has-error' : ''}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="form-label">
              <span className="label-icon">🧪</span> Subject Combination
            </label>
            <div className="select-wrap">
              <select
                className="form-select"
                value={data.subjects}
                onChange={(e) => {
                  updateField('subjects', e.target.value);
                  setErrors((er) => ({ ...er, subjects: undefined }));
                }}
              >
                <option value="">Select Subjects</option>
                <option value="PCM">PCM — Physics, Chemistry, Maths</option>
                <option value="PCB">PCB — Physics, Chemistry, Biology</option>
                <option value="PCMB">PCMB — Physics, Chemistry, Maths, Biology</option>
              </select>
              <span className="select-arrow">▾</span>
            </div>
            {errors.subjects && <span className="field-error">{errors.subjects}</span>}
          </motion.div>
        )}

        {/* Marks */}
        <div className="form-group-row" style={{ display: 'flex', gap: '16px', flexDirection: 'row' }}>
          <div className={`form-group ${errors.marksObtained ? 'has-error' : ''}`} style={{ flex: 1, minWidth: 0 }}>
            <label className="form-label">
              <span className="label-icon">📝</span> Marks Obtained
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 450"
              min="0"
              value={data.marksObtained}
              onChange={(e) => handleMarksChange('marksObtained', e.target.value)}
            />
            {errors.marksObtained && <span className="field-error" style={{ fontSize: '11px' }}>{errors.marksObtained}</span>}
          </div>
          
          <div className={`form-group ${errors.totalMarks ? 'has-error' : ''}`} style={{ flex: 1, minWidth: 0 }}>
            <label className="form-label">
              <span className="label-icon">💯</span> Total Marks
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 500"
              min="1"
              value={data.totalMarks}
              onChange={(e) => handleMarksChange('totalMarks', e.target.value)}
            />
            {errors.totalMarks && <span className="field-error" style={{ fontSize: '11px' }}>{errors.totalMarks}</span>}
          </div>
        </div>

        {/* Calculated Percentage */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">📈</span> 12th Percentage (Auto)
          </label>
          <div className="input-wrap">
            <input
              type="number"
              className="form-input"
              placeholder="Calculated automatically"
              value={data.percentage}
              readOnly
              style={{ background: 'var(--bg-subtle)', opacity: 0.8, cursor: 'not-allowed' }}
            />
            <span className="input-suffix">%</span>
          </div>
        </div>

        {/* Category */}
        <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
          <label className="form-label">
            <span className="label-icon">👤</span> Category
          </label>
          <div className="select-wrap">
            <select
              className="form-select"
              value={data.category}
              onChange={(e) => {
                updateField('category', e.target.value);
                setErrors((er) => ({ ...er, category: undefined }));
              }}
            >
              <option value="">Select Category</option>
              <option value="General">General / Open</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="NT">NT</option>
              <option value="VJ/DT">VJ / DT</option>
            </select>
            <span className="select-arrow">▾</span>
          </div>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>
      </div>

      <div className="form-actions">
        {showBack && onBack ? (
          <button className="btn btn-ghost" onClick={onBack}><FiArrowLeft size={18} /> Back</button>
        ) : <div />}
        <button className="btn btn-primary" onClick={handleNext}>
          Next Step <FiArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
