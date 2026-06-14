import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiUser, FiBook, FiAward, FiMail, FiPhone, FiSearch, FiArrowRight, FiClock, FiMapPin, FiBookmark, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { examConfig, coursesByStream } from '../config/formConfig';
import axios from 'axios';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
});

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return new URLSearchParams(window.location.search).get('tab') || 'profile';
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (user?._id) {
      axios.get(`http://localhost:5000/api/students/${user._id}/dashboard-data`)
        .then(res => setDashboardData(res.data.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  if (!user) return null;

  const config = examConfig[user.course];
  const streamDisplay = user.stream + (user.subjects ? ` (${user.subjects})` : '');
  const examDisplay =
    user.examType === 'Merit-based'
      ? 'Merit-based (no exam)'
      : `${user.examType} — ${user.examScore} ${config?.suffix || ''}`;

  const handleEditClick = () => {
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      category: user.category || 'General',
      board: user.board || '',
      stream: user.stream || 'Science',
      marksObtained: user.marksObtained || '',
      totalMarks: user.totalMarks || '',
      percentage: user.percentage || '',
      course: user.course || '',
      examType: user.examType || 'Merit-based',
      examScore: user.examScore || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/students/${user._id}`, editForm);
      if (res.data.success) {
        updateUser(res.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleMarksChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...editForm, [name]: value };

    const mo = name === 'marksObtained' ? parseFloat(value) : parseFloat(editForm.marksObtained);
    const tm = name === 'totalMarks' ? parseFloat(value) : parseFloat(editForm.totalMarks);

    if (!isNaN(mo) && !isNaN(tm) && tm > 0 && mo >= 0 && mo <= tm) {
      updatedForm.percentage = ((mo / tm) * 100).toFixed(2);
    } else {
      updatedForm.percentage = '';
    }
    setEditForm(updatedForm);
  };

  // Update course and exam logic when stream changes in edit mode
  const handleStreamChange = (e) => {
    const newStream = e.target.value;
    setEditForm({ ...editForm, stream: newStream, course: '', examType: 'Merit-based', examScore: '' });
  };

  const handleCourseChange = (e) => {
    const newCourse = e.target.value;
    const cnf = examConfig[newCourse];
    let eType = 'Merit-based';
    if (cnf?.type === 'fixed') eType = cnf.fixedExam;
    else if (cnf?.type === 'select') eType = cnf.options[0].value;

    setEditForm({ ...editForm, course: newCourse, examType: eType, examScore: '' });
  };

  const availableCourses = editForm.stream ? coursesByStream[editForm.stream] || [] : [];
  const currentExamConfig = examConfig[editForm.course];

  return (
    <div className="dashboard-page" style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '30px', minHeight: '80vh', flexWrap: 'wrap' }}>

      {/* Sidebar */}
      <motion.div className="dash-sidebar" {...fadeUp(0)} style={{ width: '280px', flexGrow: 1, maxWidth: '350px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: '12px', height: 'fit-content' }}>
        <div className="dash-avatar" style={{ marginBottom: '16px', alignSelf: 'center' }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>{user.name}</h3>

        <button
          onClick={() => { setActiveTab('profile'); setIsEditing(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'profile' ? 'var(--accent-orange)' : 'transparent', color: activeTab === 'profile' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'all 0.2s' }}
        >
          <FiUser size={18} /> My Profile
        </button>

        <button
          onClick={() => { setActiveTab('recent'); setIsEditing(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'recent' ? 'var(--accent-orange)' : 'transparent', color: activeTab === 'recent' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'all 0.2s' }}
        >
          <FiClock size={18} /> Recently Viewed
        </button>

        <button
          onClick={() => { setActiveTab('saved'); setIsEditing(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'saved' ? 'var(--accent-orange)' : 'transparent', color: activeTab === 'saved' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'all 0.2s' }}
        >
          <FiBookmark size={18} /> Saved Colleges
        </button>
      </motion.div>

      {/* Main Content Area */}
      <div className="dash-content" style={{ flexBasis: '60%', flexGrow: 999, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <AnimatePresence mode="wait">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" {...fadeUp(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                {!isEditing ? (
                  <button onClick={handleEditClick} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiEdit2 size={16} /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setIsEditing(false)} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiX size={16} /> Cancel
                    </button>
                    <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="dash-cards" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="dash-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="dash-card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '0' }}>
                    <FiUser size={24} color="var(--accent-orange)" />
                    <h2 style={{ fontSize: '1.4rem' }}>Personal Info</h2>
                  </div>
                  <div className="dash-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>

                    <div className="dash-item">
                      <span className="dash-label">Full Name</span>
                      {isEditing ? (
                        <input type="text" name="name" value={editForm.name} onChange={handleChange} className="form-input" style={{ marginTop: '8px' }} />
                      ) : (
                        <span className="dash-value">{user.name}</span>
                      )}
                    </div>

                    <div className="dash-item">
                      <span className="dash-label">Email</span>
                      {isEditing ? (
                        <input type="email" value={user.email} disabled className="form-input" style={{ marginTop: '8px', opacity: 0.6, cursor: 'not-allowed' }} title="Email cannot be changed" />
                      ) : (
                        <span className="dash-value">{user.email}</span>
                      )}
                    </div>

                    <div className="dash-item">
                      <span className="dash-label">Phone</span>
                      {isEditing ? (
                        <input type="text" name="phone" value={editForm.phone} onChange={handleChange} className="form-input" style={{ marginTop: '8px' }} />
                      ) : (
                        <span className="dash-value">{user.phone || '—'}</span>
                      )}
                    </div>

                    <div className="dash-item">
                      <span className="dash-label">Category</span>
                      {isEditing ? (
                        <select name="category" value={editForm.category} onChange={handleChange} className="form-select" style={{ marginTop: '8px' }}>
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="EWS">EWS</option>
                        </select>
                      ) : (
                        <span className="dash-value">{user.category}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dash-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="dash-card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '0' }}>
                    <FiBook size={24} color="var(--accent-orange)" />
                    <h2 style={{ fontSize: '1.4rem' }}>Academic Details</h2>
                  </div>
                  <div className="dash-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>

                    <div className="dash-item">
                      <span className="dash-label">Board</span>
                      {isEditing ? (
                        <select name="board" value={editForm.board} onChange={handleChange} className="form-select" style={{ marginTop: '8px' }}>
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
                      ) : (
                        <span className="dash-value">{user.board}</span>
                      )}
                    </div>

                    <div className="dash-item">
                      <span className="dash-label">Stream</span>
                      {isEditing ? (
                        <select name="stream" value={editForm.stream} onChange={handleStreamChange} className="form-select" style={{ marginTop: '8px' }}>
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                        </select>
                      ) : (
                        <span className="dash-value">{streamDisplay}</span>
                      )}
                    </div>

                    {isEditing ? (
                      <>
                        <div className="dash-item">
                          <span className="dash-label">Marks Obtained</span>
                          <input type="number" name="marksObtained" value={editForm.marksObtained} onChange={handleMarksChange} className="form-input" style={{ marginTop: '8px' }} min="0" />
                        </div>
                        <div className="dash-item">
                          <span className="dash-label">Total Marks</span>
                          <input type="number" name="totalMarks" value={editForm.totalMarks} onChange={handleMarksChange} className="form-input" style={{ marginTop: '8px' }} min="1" />
                        </div>
                        <div className="dash-item">
                          <span className="dash-label">12th Percentage (Auto)</span>
                          <input type="number" name="percentage" value={editForm.percentage} readOnly className="form-input" style={{ marginTop: '8px', opacity: 0.6, cursor: 'not-allowed' }} />
                        </div>
                      </>
                    ) : (
                      <>
                        {user.marksObtained && user.totalMarks && (
                          <div className="dash-item">
                            <span className="dash-label">12th Marks</span>
                            <span className="dash-value">{user.marksObtained} / {user.totalMarks}</span>
                          </div>
                        )}
                        <div className="dash-item">
                          <span className="dash-label">12th Percentage</span>
                          <span className="dash-value accent">{user.percentage}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="dash-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="dash-card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '0' }}>
                    <FiAward size={24} color="var(--accent-orange)" />
                    <h2 style={{ fontSize: '1.4rem' }}>Course & Exam</h2>
                  </div>
                  <div className="dash-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>

                    <div className="dash-item">
                      <span className="dash-label">Preferred Course</span>
                      {isEditing ? (
                        <select name="course" value={editForm.course} onChange={handleCourseChange} className="form-select" style={{ marginTop: '8px' }}>
                          <option value="">Select Course</option>
                          {availableCourses.map((c) => (
                            <option key={c.value} value={c.value}>{c.value}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="dash-value accent">{user.course}</span>
                      )}
                    </div>

                    <div className="dash-item">
                      <span className="dash-label">Entrance Exam</span>
                      {isEditing ? (
                        currentExamConfig?.type === 'select' ? (
                          <select name="examType" value={editForm.examType} onChange={handleChange} className="form-select" style={{ marginTop: '8px' }}>
                            {currentExamConfig.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={editForm.examType} disabled className="form-input" style={{ marginTop: '8px', opacity: 0.6 }} />
                        )
                      ) : (
                        <span className="dash-value">{examDisplay}</span>
                      )}
                    </div>

                    {isEditing && currentExamConfig?.type !== 'merit' && currentExamConfig && (
                      <div className="dash-item">
                        <span className="dash-label">{currentExamConfig.scoreLabel}</span>
                        <input type="number" name="examScore" value={editForm.examScore} onChange={handleChange} placeholder={currentExamConfig.placeholder} max={currentExamConfig.max} className="form-input" style={{ marginTop: '8px' }} />
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Search Colleges CTA */}
              {!isEditing && (
                <div className="dash-cta">
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
                </div>
              )}
            </motion.div>
          )}

          {/* RECENTLY VIEWED TAB */}
          {activeTab === 'recent' && (
            <motion.div key="recent" className="dash-card" {...fadeUp(0.1)}>
              <div className="dash-card-header">
                <FiClock size={20} />
                <h2>Recently Viewed Colleges</h2>
              </div>
              <div className="mini-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {dashboardData?.recentlyViewed?.length > 0 ? (
                  dashboardData.recentlyViewed.map(college => (
                    <Link to={`/search?search=${encodeURIComponent(college.college_name)}`} key={`viewed-${college._id}`} className="mini-college-card" style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', display: 'block', transition: 'all 0.2s' }}>
                      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{college.college_name}</h4>
                      <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin size={12} /> {college.city}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}><FiBook size={12} /> {college.college_type}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', padding: '2rem 0', textAlign: 'center' }}>No recently viewed colleges.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* SAVED COLLEGES TAB */}
          {activeTab === 'saved' && (
            <motion.div key="saved" className="dash-card" {...fadeUp(0.1)}>
              <div className="dash-card-header">
                <FiBookmark size={20} />
                <h2>Saved Colleges</h2>
              </div>
              <div className="mini-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {dashboardData?.savedColleges?.length > 0 ? (
                  dashboardData.savedColleges.map(college => (
                    <Link to={`/search?search=${encodeURIComponent(college.college_name)}`} key={`saved-${college._id}`} className="mini-college-card" style={{ textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', display: 'block', transition: 'all 0.2s' }}>
                      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{college.college_name}</h4>
                      <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin size={12} /> {college.city}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}><FiBook size={12} /> {college.college_type}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', padding: '2rem 0', textAlign: 'center' }}>You haven't saved any colleges yet.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
