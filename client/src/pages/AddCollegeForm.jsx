import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen, FiMapPin, FiPhone, FiAward, FiLayers,
  FiSave, FiCheckCircle, FiAlertCircle, FiChevronDown,
  FiGrid, FiArrowLeft,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Static reference data
// ─────────────────────────────────────────────────────────────────────────────
const COLLEGE_TYPES = [
  'Government', 'Private Aided', 'Private Unaided',
  'Autonomous', 'Deemed University', 'Central/NIT/IIT',
];

const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'Not accredited'];

const REGULATORY = [
  'AICTE', 'UGC', 'NMC', 'PCI', 'BCI',
  'MUHS', 'DTE', 'MSBTE', 'NBA accredited', 'Autonomous',
];

const STREAM_COURSES = {
  Engineering:   ['B.E./B.Tech', 'M.E./M.Tech', 'Diploma Engineering', 'Ph.D'],
  Medical:       ['MBBS', 'MD/MS', 'BDS', 'MDS', 'BAMS', 'BHMS'],
  Pharmacy:      ['B.Pharm', 'M.Pharm', 'D.Pharm', 'Pharm.D'],
  Science:       ['B.Sc', 'M.Sc', 'Ph.D', 'B.Sc (Hons)'],
  Arts:          ['B.A', 'M.A', 'B.A (Hons)', 'Ph.D'],
  Commerce:      ['B.Com', 'M.Com', 'B.Com (Hons)', 'Ph.D'],
  Management:    ['BBA', 'MBA', 'MMS', 'PGDM', 'Ph.D'],
  Law:           ['LLB (3yr)', 'LLB (5yr)', 'LLM', 'Ph.D'],
  Computer:      ['BCA', 'MCA', 'B.Sc IT', 'M.Sc IT', 'Ph.D'],
  Education:     ['B.Ed', 'M.Ed', 'D.El.Ed', 'Ph.D'],
  Architecture:  ['B.Arch', 'M.Arch', 'Ph.D'],
  Nursing:       ['GNM', 'B.Sc Nursing', 'M.Sc Nursing', 'Post Basic B.Sc'],
};

const STREAM_ICONS = {
  Engineering: '⚙️', Medical: '🏥', Pharmacy: '💊', Science: '🔬',
  Arts: '🎨', Commerce: '💰', Management: '📊', Law: '⚖️',
  Computer: '💻', Education: '📚', Architecture: '🏛️', Nursing: '🩺',
};

const SECTION_ICONS = [FiBookOpen, FiLayers, FiMapPin, FiPhone, FiAward, FiGrid];
const SECTION_LABELS = [
  'Basic Info', 'Affiliation', 'Location', 'Contact', 'Accreditation', 'Streams & Courses',
];

const API = 'http://localhost:5000/api/admin/colleges';

// ─────────────────────────────────────────────────────────────────────────────
// Initial form state
// ─────────────────────────────────────────────────────────────────────────────
const INIT = {
  college_name: '', college_short_name: '', dte_code: '', established_year: '',
  university_name: '', college_type: '', minority_status: 'Non-minority', minority_community: '',
  address: '', city: '', district: '', pin_code: '',
  email: '', website: '', phone: '',
  naac_grade: '', naac_cgpa: '', regulatory_approvals: [],
  streams: [], courses: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, delay, ease: [0.16, 1, 0.3, 1] } },
});

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="acf-section-header">
      <div className="acf-section-icon"><Icon size={18} /></div>
      <div>
        <h3 className="acf-section-title">{title}</h3>
        {subtitle && <p className="acf-section-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

function FormField({ label, required, error, children, hint }) {
  return (
    <div className={`form-group${error ? ' has-error' : ''}`}>
      <label className="form-label">
        {label} {required && <span className="acf-required">*</span>}
      </label>
      {children}
      {hint && !error && <span className="acf-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AddCollegeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  // ── Fetch existing data if in Edit Mode ────────────────────────────────────
  useEffect(() => {
    if (isEditMode) {
      const fetchCollege = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/admin/colleges/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = res.data.data;
          
          // Map backend course structure to form structure
          const mappedCourses = (data.courses || []).map(c => ({
            stream: c.stream_category,
            course: c.course_name
          }));
          
          setForm({
            ...INIT,
            ...data,
            courses: mappedCourses,
            established_year: data.established_year || '',
            naac_cgpa: data.naac_cgpa || '',
            pin_code: data.pin_code || '',
          });
        } catch (err) {
          console.error('Failed to fetch college details', err);
          setToast({ type: 'error', msg: 'Failed to load college details.' });
        }
      };
      fetchCollege();
    }
  }, [id, isEditMode, token]);

  // ── Field updater ──────────────────────────────────────────────────────────
  const set = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // ── Regulatory pill toggle ─────────────────────────────────────────────────
  const toggleRegulatory = useCallback((item) => {
    setForm(prev => ({
      ...prev,
      regulatory_approvals: prev.regulatory_approvals.includes(item)
        ? prev.regulatory_approvals.filter(r => r !== item)
        : [...prev.regulatory_approvals, item],
    }));
  }, []);

  // ── Stream toggle ──────────────────────────────────────────────────────────
  const toggleStream = useCallback((stream) => {
    setForm(prev => {
      const active = prev.streams.includes(stream);
      if (active) {
        // Remove stream AND its courses
        return {
          ...prev,
          streams: prev.streams.filter(s => s !== stream),
          courses: prev.courses.filter(c => c.stream !== stream),
        };
      }
      return { ...prev, streams: [...prev.streams, stream] };
    });
  }, []);

  // ── Course pill toggle ─────────────────────────────────────────────────────
  const toggleCourse = useCallback((stream, course) => {
    setForm(prev => {
      const exists = prev.courses.some(c => c.stream === stream && c.course === course);
      if (exists) return { ...prev, courses: prev.courses.filter(c => !(c.stream === stream && c.course === course)) };
      return { ...prev, courses: [...prev.courses, { stream, course }] };
    });
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.college_name.trim()) errs.college_name = 'College name is required';
    if (!form.university_name.trim()) errs.university_name = 'Affiliated university is required';
    if (!form.college_type) errs.college_type = 'College type is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (form.minority_status !== 'Non-minority' && !form.minority_community.trim())
      errs.minority_community = 'Please specify the community name';
    if (form.pin_code && !/^\d{6}$/.test(form.pin_code))
      errs.pin_code = 'PIN code must be 6 digits';
    if (form.naac_cgpa && (isNaN(form.naac_cgpa) || form.naac_cgpa < 0 || form.naac_cgpa > 10))
      errs.naac_cgpa = 'CGPA must be between 0 and 10';
    if (form.established_year && (isNaN(form.established_year) || form.established_year < 1800 || form.established_year > new Date().getFullYear()))
      errs.established_year = 'Enter a valid year';
    if (form.streams.length === 0)
      errs.streams = 'Please select at least one stream';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: only actually save on the final section (Streams & Courses)
    // Pressing Enter on earlier sections just advances to the next section
    if (activeSection < 5) {
      setActiveSection(s => Math.min(5, s + 1));
      return;
    }

    if (!validate()) {
      setToast({ type: 'error', msg: 'Please fix the highlighted errors before submitting.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        established_year: form.established_year ? Number(form.established_year) : null,
        naac_cgpa: form.naac_cgpa ? Number(form.naac_cgpa) : null,
      };
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/admin/colleges/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToast({ type: 'success', msg: '🎉 College updated successfully!' });
      } else {
        await axios.post(API, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToast({ type: 'success', msg: '🎉 College added to database successfully!' });
        setTimeout(() => {
          setForm(INIT);
          setActiveSection(0);
        }, 1000);
      }
      setTimeout(() => {
        setToast(null);
        if (isEditMode) navigate('/admin/dashboard');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add college. Please try again.';
      setToast({ type: 'error', msg });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Section nav dots ───────────────────────────────────────────────────────
  const isCourseSelected = (stream, course) =>
    form.courses.some(c => c.stream === stream && c.course === course);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="acf-page">
      {/* ── Sidebar nav ── */}
      <aside className="acf-sidebar">
        <button type="button" className="acf-back-btn" onClick={() => navigate('/admin/dashboard')}>
          <FiArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="acf-sidebar-title">{isEditMode ? 'Edit College' : 'Add College'}</div>
        <nav className="acf-nav">
          {SECTION_LABELS.map((label, i) => {
            const Icon = SECTION_ICONS[i];
            return (
              <button
                key={i}
                className={`acf-nav-item${activeSection === i ? ' active' : ''}`}
                onClick={() => setActiveSection(i)}
              >
                <Icon size={16} />
                <span>{label}</span>
                {i < 4 && (
                  <span className="acf-nav-dot" style={{
                    background: i === 0 && (form.college_name || form.university_name) ? 'var(--success)' :
                               i === 1 && form.college_type ? 'var(--success)' :
                               i === 2 && form.city ? 'var(--success)' :
                               i === 3 && (form.email || form.phone) ? 'var(--success)' :
                               'transparent'
                  }} />
                )}
              </button>
            );
          })}
        </nav>
        {/* Progress */}
        <div className="acf-progress-box">
          <div className="acf-progress-label">Form Progress</div>
          <div className="acf-progress-track">
            <div className="acf-progress-fill" style={{
              width: `${Math.round(
                ([form.college_name, form.university_name, form.college_type, form.city].filter(Boolean).length / 4) * 100
              )}%`
            }} />
          </div>
          <div className="acf-progress-pct">
            {Math.round(([form.college_name, form.university_name, form.college_type, form.city].filter(Boolean).length / 4) * 100)}% required fields filled
          </div>
        </div>
      </aside>

      {/* ── Main form ── */}
      <main className="acf-main">
        <form
          noValidate
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
          }}
        >
          {/* ── Section 0: Basic Identification ── */}
          <AnimatePresence mode="wait">
            {activeSection === 0 && (
              <motion.div key="s0" {...fadeUp(0)} className="acf-section">
                <SectionHeader icon={FiBookOpen} title="Basic Identification" subtitle="Core identity details of the college" />
                <div className="acf-grid acf-grid-2">
                  <FormField label="College Name" required error={errors.college_name}>
                    <input id="college_name" className="form-input" type="text" placeholder="e.g. College of Engineering Pune" value={form.college_name} onChange={e => set('college_name', e.target.value)} />
                  </FormField>
                  <FormField label="Short Name / Abbreviation" error={errors.short_name}>
                    <input id="college_short_name" className="form-input" type="text" placeholder="e.g. COEP" value={form.college_short_name} onChange={e => set('college_short_name', e.target.value)} />
                  </FormField>
                  <FormField label="DTE College Code" error={errors.dte_code} hint="As per DTE Maharashtra records">
                    <input id="dte_code" className="form-input" type="text" placeholder="e.g. 1461" value={form.dte_code} onChange={e => set('dte_code', e.target.value)} />
                  </FormField>
                  <FormField label="Established Year" error={errors.established_year}>
                    <input id="established_year" className="form-input" type="number" placeholder="e.g. 1994" min="1800" max={new Date().getFullYear()} value={form.established_year} onChange={e => set('established_year', e.target.value)} />
                  </FormField>
                </div>
              </motion.div>
            )}

            {/* ── Section 1: Affiliation & Type ── */}
            {activeSection === 1 && (
              <motion.div key="s1" {...fadeUp(0)} className="acf-section">
                <SectionHeader icon={FiLayers} title="Affiliation & Type" subtitle="University affiliation and institution classification" />
                <div className="acf-grid acf-grid-1">
                  <FormField label="Affiliated University" required error={errors.university_name}>
                    <input id="university_name" className="form-input" type="text" placeholder="e.g. Savitribai Phule Pune University" value={form.university_name} onChange={e => set('university_name', e.target.value)} />
                  </FormField>
                </div>
                <div className="acf-grid acf-grid-2">
                  <FormField label="College Type" required error={errors.college_type}>
                    <div className="select-wrap">
                      <select id="college_type" className="form-select" value={form.college_type} onChange={e => set('college_type', e.target.value)}>
                        <option value="">Select type…</option>
                        {COLLEGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <FiChevronDown className="select-arrow" />
                    </div>
                  </FormField>
                  <FormField label="Minority Status" error={errors.minority_status}>
                    <div className="select-wrap">
                      <select id="minority_status" className="form-select" value={form.minority_status} onChange={e => set('minority_status', e.target.value)}>
                        <option value="Non-minority">Non-minority</option>
                        <option value="Religious">Religious</option>
                        <option value="Linguistic">Linguistic</option>
                      </select>
                      <FiChevronDown className="select-arrow" />
                    </div>
                  </FormField>
                </div>
                <AnimatePresence>
                  {form.minority_status !== 'Non-minority' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FormField label="Community Name" required error={errors.minority_community} hint={`Specify the ${form.minority_status.toLowerCase()} community`}>
                        <input id="minority_community" className="form-input" type="text" placeholder={form.minority_status === 'Religious' ? 'e.g. Catholic, Muslim, Hindu…' : 'e.g. Marathi, Gujarati, Urdu…'} value={form.minority_community} onChange={e => set('minority_community', e.target.value)} />
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Section 2: Location ── */}
            {activeSection === 2 && (
              <motion.div key="s2" {...fadeUp(0)} className="acf-section">
                <SectionHeader icon={FiMapPin} title="Location" subtitle="Physical address and geographical details" />
                <FormField label="Full Address" error={errors.address}>
                  <textarea id="address" className="form-input acf-textarea" rows={3} placeholder="Survey No., Street, Area…" value={form.address} onChange={e => set('address', e.target.value)} />
                </FormField>
                <div className="acf-grid acf-grid-3" style={{ marginTop: 20 }}>
                  <FormField label="City" required error={errors.city}>
                    <input id="city" className="form-input" type="text" placeholder="e.g. Pune" value={form.city} onChange={e => set('city', e.target.value)} />
                  </FormField>
                  <FormField label="District" error={errors.district}>
                    <input id="district" className="form-input" type="text" placeholder="e.g. Pune" value={form.district} onChange={e => set('district', e.target.value)} />
                  </FormField>
                  <FormField label="PIN Code" error={errors.pin_code} hint="6-digit">
                    <input id="pin_code" className="form-input" type="text" maxLength={6} placeholder="e.g. 411005" value={form.pin_code} onChange={e => set('pin_code', e.target.value)} />
                  </FormField>
                </div>
              </motion.div>
            )}

            {/* ── Section 3: Contact ── */}
            {activeSection === 3 && (
              <motion.div key="s3" {...fadeUp(0)} className="acf-section">
                <SectionHeader icon={FiPhone} title="Contact Information" subtitle="Official contact details of the college" />
                <div className="acf-grid acf-grid-1">
                  <FormField label="Official Email" error={errors.email}>
                    <input id="email" className="form-input" type="email" placeholder="admission@college.edu.in" value={form.email} onChange={e => set('email', e.target.value)} />
                  </FormField>
                  <FormField label="Website URL" error={errors.website}>
                    <input id="website" className="form-input" type="url" placeholder="https://www.college.edu.in" value={form.website} onChange={e => set('website', e.target.value)} />
                  </FormField>
                  <FormField label="Phone Number" error={errors.phone}>
                    <input id="phone" className="form-input" type="tel" placeholder="+91 20 12345678" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </FormField>
                </div>
              </motion.div>
            )}

            {/* ── Section 4: Accreditation ── */}
            {activeSection === 4 && (
              <motion.div key="s4" {...fadeUp(0)} className="acf-section">
                <SectionHeader icon={FiAward} title="Accreditation" subtitle="NAAC grade, CGPA and regulatory approvals" />
                <div className="acf-grid acf-grid-2">
                  <FormField label="NAAC Grade" error={errors.naac_grade}>
                    <div className="select-wrap">
                      <select id="naac_grade" className="form-select" value={form.naac_grade} onChange={e => set('naac_grade', e.target.value)}>
                        <option value="">Select grade…</option>
                        {NAAC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <FiChevronDown className="select-arrow" />
                    </div>
                  </FormField>
                  <FormField label="NAAC CGPA" error={errors.naac_cgpa} hint="e.g. 3.45 (out of 4.00 or 10.00)">
                    <input id="naac_cgpa" className="form-input" type="number" step="0.01" min="0" max="10" placeholder="e.g. 3.45" value={form.naac_cgpa} onChange={e => set('naac_cgpa', e.target.value)} />
                  </FormField>
                </div>

                <div style={{ marginTop: 28 }}>
                  <p className="form-label" style={{ marginBottom: 14 }}>Regulatory Approvals <span className="acf-hint">(multi-select)</span></p>
                  <div className="acf-pill-group">
                    {REGULATORY.map(r => (
                      <button
                        type="button"
                        key={r}
                        id={`reg-${r.replace(/\s+/g, '-')}`}
                        className={`acf-pill${form.regulatory_approvals.includes(r) ? ' active' : ''}`}
                        onClick={() => toggleRegulatory(r)}
                      >
                        {form.regulatory_approvals.includes(r) && <FiCheckCircle size={13} />}
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Section 5: Streams & Courses ── */}
            {activeSection === 5 && (
              <motion.div key="s5" {...fadeUp(0)} className="acf-section">
                <SectionHeader icon={FiGrid} title="Streams & Courses" subtitle="Select streams and the courses offered within each" />

                <div className="acf-stream-grid">
                  {Object.entries(STREAM_COURSES).map(([stream, courses]) => {
                    const isActive = form.streams.includes(stream);
                    return (
                      <motion.div
                        key={stream}
                        className={`acf-stream-card${isActive ? ' selected' : ''}`}
                        layout
                        transition={{ duration: 0.25 }}
                      >
                        {/* Stream header — click to toggle stream */}
                        <button
                          type="button"
                          id={`stream-${stream}`}
                          className="acf-stream-header"
                          onClick={() => toggleStream(stream)}
                        >
                          <span className="acf-stream-emoji">{STREAM_ICONS[stream]}</span>
                          <span className="acf-stream-name">{stream}</span>
                          <span className={`acf-stream-check${isActive ? ' on' : ''}`}>
                            {isActive ? <FiCheckCircle size={16} /> : <span className="acf-circle-empty" />}
                          </span>
                        </button>

                        {/* Course pills — visible always, selectable */}
                        <div className="acf-course-pills">
                          {courses.map(course => {
                            const selected = isCourseSelected(stream, course);
                            return (
                              <button
                                type="button"
                                key={course}
                                id={`course-${stream}-${course.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                className={`acf-course-pill${selected ? ' active' : ''}${!isActive ? ' dim' : ''}`}
                                onClick={() => {
                                  if (!isActive) toggleStream(stream); // auto-select stream
                                  toggleCourse(stream, course);
                                }}
                              >
                                {course}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary */}
                {form.streams.length > 0 ? (
                  <motion.div className="acf-stream-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <strong>{form.streams.length}</strong> stream{form.streams.length > 1 ? 's' : ''} selected &nbsp;·&nbsp;
                    <strong>{form.courses.length}</strong> course{form.courses.length !== 1 ? 's' : ''} selected
                  </motion.div>
                ) : errors.streams ? (
                  <div style={{ marginTop: 14, padding: '10px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-md)', color: 'var(--text-error)', fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚠️ {errors.streams}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Section Navigation Buttons ── */}
          <div className="acf-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setActiveSection(s => Math.max(0, s - 1))}
              disabled={activeSection === 0}
            >
              ← Previous
            </button>

            <div className="acf-section-dots">
              {SECTION_LABELS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`acf-dot${activeSection === i ? ' active' : ''}`}
                  onClick={() => setActiveSection(i)}
                  aria-label={`Go to section ${i + 1}`}
                />
              ))}
            </div>

            {activeSection < 5 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveSection(s => Math.min(5, s + 1))}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-confirm"
                disabled={submitting}
                id="submit-college-btn"
                onClick={() => handleSubmit({ preventDefault: () => {} })}
              >
                {submitting ? (
                  <><span className="acf-spinner" /> Saving…</>
                ) : (
                  <><FiSave size={16} /> {isEditMode ? 'Save Changes' : 'Save College'}</>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`acf-toast ${toast.type}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {toast.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
