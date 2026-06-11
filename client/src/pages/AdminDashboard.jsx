import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiBookOpen, FiAward, FiLogOut, FiShield, FiMail, FiPlusSquare, FiSearch, FiPieChart, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] } },
});

const COLORS = ['#5b5ff6', '#0ea5e9', '#22c55e', '#f59e0b', '#7c5cf6', '#ef4444'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Course modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    category: '',
    duration: 3,
    eligibility: '',
    entranceExams: '',
    careerPaths: ''
  });

  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Use auth token for admin requests
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, studentsRes, collegesRes, coursesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/students', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/colleges?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/courses')
        ]);
        setStats(statsRes.data.data);
        setStudents(studentsRes.data.data);
        setColleges(collegesRes.data.data || []);
        setCourses(coursesRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMakeAdmin = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/students/${id}/make-admin`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(students.map(s => s._id === id ? { ...s, isAdmin: true } : s));
    } catch (err) {
      console.error('Failed to promote student', err);
      alert('Failed to promote student. Ensure you have the correct permissions.');
    }
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm('Are you sure you want to delete this college? This action cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/colleges/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setColleges(colleges.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete college', err);
      alert('Failed to delete college.');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete course', err);
      alert('Failed to delete course.');
    }
  };

  const handleOpenCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        name: course.name,
        category: course.category,
        duration: course.duration,
        eligibility: course.eligibility || '',
        entranceExams: (course.entranceExams || []).join(', '),
        careerPaths: (course.careerPaths || []).join(', ')
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        name: '',
        category: '',
        duration: 3,
        eligibility: '',
        entranceExams: '',
        careerPaths: ''
      });
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.category || !courseForm.duration) {
      alert('Name, Category and Duration are required');
      return;
    }

    const payload = {
      ...courseForm,
      entranceExams: courseForm.entranceExams.split(',').map(ex => ex.trim()).filter(Boolean),
      careerPaths: courseForm.careerPaths.split(',').map(cp => cp.trim()).filter(Boolean)
    };

    try {
      if (editingCourse) {
        // Edit course
        const res = await axios.put(`http://localhost:5000/api/courses/${editingCourse._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) {
          setCourses(courses.map(c => c._id === editingCourse._id ? res.data.data : c));
          alert('Course updated successfully');
        }
      } else {
        // Add course
        const res = await axios.post('http://localhost:5000/api/courses', payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) {
          setCourses([...courses, res.data.data]);
          alert('Course added successfully');
        }
      }
      setShowCourseModal(false);
    } catch (err) {
      console.error('Failed to save course', err);
      alert(err.response?.data?.message || 'Failed to save course');
    }
  };

  const uniqueCities = [...new Set(colleges.map(c => c.city).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(colleges.map(c => c.college_type).filter(Boolean))].sort();
  const uniqueStreams = [...new Set(colleges.flatMap(c => c.streams || []).filter(Boolean))].sort();

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.college_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (college.college_short_name && college.college_short_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      matchesSearch &&
      (filterCity === '' || college.city === filterCity) &&
      (filterType === '' || college.college_type === filterType) &&
      (filterStream === '' || (college.streams || []).includes(filterStream))
    );
  });

  if (loading) return <div className="loading-screen"><div className="loader" /></div>;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="logo" style={{ justifyContent: 'flex-start', marginBottom: '30px' }}>
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.25)', width: '36px', height: '36px', fontSize: '1.2rem' }}>
            <FiShield color="white" />
          </div>
          <span className="logo-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.4rem' }}>
            Admin Portal
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--r-md)' }}>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', width: '40px', height: '40px', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', borderRadius: '50%', fontWeight: 'bold' }}>
            A
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>{user?.email?.split('@')[0] || 'Admin'}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</p>
          </div>
        </div>

        <nav className="admin-nav">
          <div className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <FiPieChart size={18} />
            Platform Overview
          </div>
          <div className={`admin-nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <FiUsers size={18} />
            Students Database
          </div>
          <div className={`admin-nav-item ${activeTab === 'colleges' ? 'active' : ''}`} onClick={() => setActiveTab('colleges')}>
            <FiBookOpen size={18} />
            Colleges Database
          </div>
          <div className={`admin-nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <FiBookOpen size={18} />
            Courses Database
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          {activeTab === 'courses' ? (
            <button
              className="btn btn-ghost btn-full"
              style={{ color: 'var(--accent-orange)', borderColor: 'rgba(249,115,22,0.3)', justifyContent: 'center' }}
              onClick={() => handleOpenCourseModal()}
            >
              <FiPlusSquare size={16} /> Add Course
            </button>
          ) : (
            <button
              className="btn btn-ghost btn-full"
              style={{ color: 'var(--accent-orange)', borderColor: 'rgba(249,115,22,0.3)', justifyContent: 'center' }}
              onClick={() => navigate('/admin/add-college')}
            >
              <FiPlusSquare size={16} /> Add College
            </button>
          )}
          <button className="btn btn-ghost btn-full" onClick={logout} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)', justifyContent: 'center' }}>
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'overview' && stats && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ marginBottom: '30px' }}>
              <h1 className="dash-name" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>Welcome back! 👋</h1>
              <p className="dash-email" style={{ color: 'var(--text-secondary)' }}>Here is what's happening on your platform today.</p>
            </div>
            
            <div className="dash-cards">
              <motion.div className="dash-card" {...fadeUp(0.2)}>
                <div className="dash-card-header">
                  <FiUsers size={20} />
                  <h2>Platform Overview</h2>
                </div>
                <div className="dash-card-grid">
                  <div className="dash-item">
                    <span className="dash-label">Total Students</span>
                    <span className="dash-value accent" style={{ fontSize: '1.75rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.totalStudents}</span>
                  </div>
                  <div className="dash-item">
                    <span className="dash-label">Total Streams</span>
                    <span className="dash-value" style={{ fontSize: '1.75rem' }}>{stats.studentsByStream.length}</span>
                  </div>
                  <div className="dash-item">
                    <span className="dash-label">Total Colleges</span>
                    <span className="dash-value" style={{ fontSize: '1.75rem', color: 'var(--accent-violet)' }}>{stats.totalColleges || 0}</span>
                  </div>
                  <div className="dash-item">
                    <span className="dash-label">Active Users (7d)</span>
                    <span className="dash-value" style={{ fontSize: '1.75rem', color: 'var(--success)' }}>{stats.activeUsers || 0}</span>
                  </div>
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '26px' }}>
                <motion.div className="dash-card" {...fadeUp(0.3)}>
                  <div className="dash-card-header">
                    <FiBookOpen size={20} />
                    <h2>Students by Stream</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '1rem' }}>
                    {stats.studentsByStream.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ width: '90px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{item.name}</span>
                        <div style={{ flex: 1, height: '10px', background: 'var(--border-default)', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${(item.value / stats.totalStudents) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: '5px', transition: 'width 1s ease-out' }}></div>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)', width: '30px', textAlign: 'right' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="dash-card" {...fadeUp(0.4)}>
                  <div className="dash-card-header">
                    <FiAward size={20} />
                    <h2>Students by Category</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '1rem' }}>
                    {stats.studentsByCategory.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ width: '90px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{item.name}</span>
                        <div style={{ flex: 1, height: '10px', background: 'var(--border-default)', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${(item.value / stats.totalStudents) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: '5px', transition: 'width 1s ease-out' }}></div>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)', width: '30px', textAlign: 'right' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Most Searched & Most Viewed */}
                <motion.div className="dash-card" {...fadeUp(0.6)}>
                  <div className="dash-card-header">
                    <FiSearch size={20} />
                    <h2>Most Searched Queries</h2>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    {(stats.topSearched || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>{item.query}</span>
                        <span style={{ background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.count} searches</span>
                      </div>
                    ))}
                    {!(stats.topSearched && stats.topSearched.length > 0) && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No searches yet</p>}
                  </div>
                </motion.div>

                <motion.div className="dash-card" {...fadeUp(0.7)}>
                  <div className="dash-card-header">
                    <FiBookOpen size={20} />
                    <h2>Most Viewed Colleges</h2>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    {(stats.topViewedColleges || []).map((college, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{college.college_name}</span>
                        <span style={{ background: 'rgba(249,115,22,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--accent-orange)', fontWeight: '600' }}>{college.views || 0} views</span>
                      </div>
                    ))}
                    {!(stats.topViewedColleges && stats.topViewedColleges.length > 0) && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No views yet</p>}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="dash-card" style={{ overflowX: 'auto', padding: '0' }}>
            <div className="dash-card-header" style={{ padding: '24px 30px', borderBottom: '1px solid var(--border-default)', marginBottom: '0' }}>
              <FiUsers size={20} />
              <h2 style={{ margin: 0 }}>Registered Students Database</h2>
            </div>
            <div style={{ padding: '10px 30px 30px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Background</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Course</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 8px', fontWeight: '600', color: 'var(--text-primary)' }}>{student.name}</td>
                      <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{student.email}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>{student.board} • <span style={{ color: 'var(--accent-orange)' }}>{student.percentage}%</span></span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{student.stream} {student.subjects && `(${student.subjects})`}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', background: 'var(--info-bg)', color: 'var(--info)', borderRadius: 'var(--r-sm)', fontSize: '0.8rem', fontWeight: '600' }}>
                          {student.course}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                        {student.isAdmin ? (
                          <span style={{ padding: '4px 10px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-violet)', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: '600' }}>
                            <FiShield style={{ marginRight: '4px', verticalAlign: 'text-top' }} /> Admin
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMakeAdmin(student._id)}
                            style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 'var(--r-md)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(34, 197, 94, 0.2)' }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>No students registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'colleges' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="dash-card" style={{ overflowX: 'auto', padding: '0' }}>
            <div className="dash-card-header" style={{ padding: '24px 30px', borderBottom: '1px solid var(--border-default)', marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiBookOpen size={20} />
                <h2 style={{ margin: 0 }}>Colleges Database</h2>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '0 12px', flex: '1 1 200px', maxWidth: '300px' }}>
                  <FiSearch color="var(--text-muted)" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search colleges..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', padding: '8px', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <select 
                  value={filterCity} 
                  onChange={(e) => setFilterCity(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>

                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>

                <select 
                  value={filterStream} 
                  onChange={(e) => setFilterStream(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="">All Streams</option>
                  {uniqueStreams.map(stream => <option key={stream} value={stream}>{stream}</option>)}
                </select>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/add-college')}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', height: '38px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <FiPlusSquare size={16} /> Add College
                </button>
              </div>
            </div>
            <div style={{ padding: '10px 30px 30px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College Name</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City & Type</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streams</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColleges.map(college => (
                    <tr key={college._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {college.college_name}
                        {college.college_short_name && <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.85rem' }}>({college.college_short_name})</span>}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '500' }}>{college.city}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{college.college_type}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(college.streams || []).slice(0, 3).map(stream => (
                            <span key={stream} style={{ padding: '2px 8px', background: 'var(--border-default)', borderRadius: 'var(--r-sm)', fontSize: '0.75rem' }}>
                              {stream}
                            </span>
                          ))}
                          {(college.streams || []).length > 3 && (
                            <span style={{ padding: '2px 8px', background: 'var(--border-default)', borderRadius: 'var(--r-sm)', fontSize: '0.75rem' }}>
                              +{(college.streams.length - 3)} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate(`/admin/edit-college/${college._id}`)}
                          style={{ background: 'transparent', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange)', padding: '4px 10px', borderRadius: 'var(--r-md)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', marginRight: '8px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCollege(college._id)}
                          style={{ background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', padding: '4px 10px', borderRadius: 'var(--r-md)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredColleges.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>No colleges match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'courses' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="dash-card" style={{ overflowX: 'auto', padding: '0' }}>
            <div className="dash-card-header" style={{ padding: '24px 30px', borderBottom: '1px solid var(--border-default)', marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiBookOpen size={20} />
                <h2 style={{ margin: 0 }}>Courses Database</h2>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '0 12px', flex: '1 1 200px', maxWidth: '300px' }}>
                  <FiSearch color="var(--text-muted)" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search courses..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', padding: '8px', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenCourseModal()}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', height: '38px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <FiPlusSquare size={16} /> Add Course
                </button>
              </div>
            </div>
            
            <div style={{ padding: '10px 30px 30px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Name</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entrance Exams</th>
                    <th style={{ padding: '16px 8px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())).map(course => (
                    <tr key={course._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 8px', fontWeight: '600', color: 'var(--text-primary)' }}>{course.name}</td>
                      <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{course.category}</td>
                      <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{course.duration} {course.duration === 1 ? 'Year' : 'Years'}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(course.entranceExams || []).map(exam => (
                            <span key={exam} style={{ padding: '2px 8px', background: 'var(--border-default)', borderRadius: 'var(--r-sm)', fontSize: '0.75rem' }}>
                              {exam}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenCourseModal(course)}
                          style={{ background: 'transparent', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange)', padding: '4px 10px', borderRadius: 'var(--r-md)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', marginRight: '8px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          style={{ background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', padding: '4px 10px', borderRadius: 'var(--r-md)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>No courses found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      {/* Course Modal */}
      {showCourseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px', borderBottom: '1px solid var(--border-default)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button onClick={() => setShowCourseModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCourse} style={{ padding: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Course Name</label>
                  <input 
                    type="text" 
                    value={courseForm.name} 
                    onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                    placeholder="e.g. B.Tech"
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                  <select 
                    value={courseForm.category} 
                    onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Medical & Health Sciences">Medical & Health Sciences</option>
                    <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Management & Business">Management & Business</option>
                    <option value="Science">Science</option>
                    <option value="Computer Applications & IT">Computer Applications & IT</option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Law">Law</option>
                    <option value="Architecture & Planning">Architecture & Planning</option>
                    <option value="Agriculture & Allied Sciences">Agriculture & Allied Sciences</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Duration (Years)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={courseForm.duration} 
                    onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g. 4"
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Eligibility</label>
                  <input 
                    type="text" 
                    value={courseForm.eligibility} 
                    onChange={e => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                    placeholder="e.g. 10+2 with PCM"
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Top Entrance Exams (comma-separated)</label>
                  <input 
                    type="text" 
                    value={courseForm.entranceExams} 
                    onChange={e => setCourseForm({ ...courseForm, entranceExams: e.target.value })}
                    placeholder="e.g. JEE Main, MHT-CET"
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Career Opportunities (comma-separated)</label>
                  <input 
                    type="text" 
                    value={courseForm.careerPaths} 
                    onChange={e => setCourseForm({ ...courseForm, careerPaths: e.target.value })}
                    placeholder="e.g. Software Engineer, Web Developer"
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
                <button type="button" onClick={() => setShowCourseModal(false)} className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>Save Course</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
