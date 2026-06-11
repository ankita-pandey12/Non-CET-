import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiBook, FiFilter, FiArrowLeft, FiChevronDown,
  FiChevronLeft, FiChevronRight, FiGlobe, FiAward, FiUsers,
  FiX, FiStar, FiCalendar, FiHome, FiExternalLink, FiMail,
  FiTrendingUp, FiLayers, FiZap, FiMessageSquare, FiSend, FiBookmark
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://localhost:5000/api/colleges';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] } },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2 } },
};

function CollegeTypeIcon({ type }) {
  if (!type) return <FiHome size={14} />;
  const t = type.toLowerCase();
  if (t.includes('government')) return <FiAward size={14} />;
  if (t.includes('aided')) return <FiUsers size={14} />;
  return <FiHome size={14} />;
}

function CollegeTypeBadge({ type }) {
  if (!type) return null;
  const t = type.toLowerCase();
  let cls = 'college-type-badge';
  if (t.includes('government')) cls += ' govt';
  else if (t.includes('aided')) cls += ' aided';
  else cls += ' private';
  return (
    <span className={cls}>
      <CollegeTypeIcon type={type} />
      {type}
    </span>
  );
}

function CutoffPill({ cutoff }) {
  if (!cutoff) return null;
  return (
    <div className="cutoff-pill">
      <FiTrendingUp size={13} />
      <span className="cutoff-cat">{cutoff.category}</span>
      <span className="cutoff-val">{cutoff.cutoff_value}</span>
      <span className="cutoff-type">{cutoff.cutoff_type}</span>
    </div>
  );
}

function CollegeCard({ college, index, user, isSaved, onSaveToggle }) {
  const [expanded, setExpanded] = useState(() => {
    const searchParam = new URLSearchParams(window.location.search).get('search');
    if (!searchParam) return false;
    const searchNorm = searchParam.trim().toLowerCase();
    return college.college_name.toLowerCase().includes(searchNorm) || 
           (college.college_short_name && college.college_short_name.toLowerCase().includes(searchNorm));
  });
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'chat'
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const collegeContext = JSON.stringify({
        full_name: college.college_name,
        short_name: college.college_short_name,
        official_website: college.website || 'Not available',
        email: college.email || 'Not available',
        address: college.address || 'Not available',
        city: college.city,
        district: college.district,
        pin_code: college.pin_code,
        university_affiliated_to: college.university_name,
        college_type: college.college_type,
        minority_status: college.minority_status,
        established_year: college.established_year,
        naac_grade: college.naac_grade,
        remarks: college.remarks || 'None',
        courses_offered: college.courses?.length > 0
          ? college.courses.map(c =>
              `${c.course_name}${c.specialization ? ` (${c.specialization})` : ''} - ${c.degree_type}, ${c.duration_years} year(s), Admission: ${c.admission_type || 'N/A'}${c.total_seats ? `, Seats: ${c.total_seats}` : ''}`
            )
          : ['No specific course data available in database'],
        cutoffs_last_year: college.cutoffs?.length > 0
          ? college.cutoffs.map(c =>
              `${c.course_name}${c.specialization ? ` (${c.specialization})` : ''} [${c.category} / ${c.domicile || 'N/A'}]: ${c.cutoff_value} ${c.cutoff_type || ''} (Round ${c.round_number || 1})`
            )
          : ['No cutoff data available in database']
      }, null, 2);

      const res = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage.content,
        collegeName: college.college_name,
        website: college.website,
        collegeData: collegeContext
      });
      setMessages((prev) => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to the AI agent right now.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const naacColor = (grade) => {
    if (!grade) return '';
    if (grade.includes('A+') || grade === 'A++') return 'naac-excellent';
    if (grade.includes('A')) return 'naac-good';
    if (grade.includes('B')) return 'naac-avg';
    return '';
  };

  const relevantCutoffs = (college.relevantCutoffs || college.cutoffs || []).slice(0, 4);
  const courses = (college.courses || []).slice(0, 8);
  const hasCutoffs = relevantCutoffs.length > 0;
  const hasCourses = courses.length > 0;

  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded && user && user.role === 'student') {
      axios.post(`http://localhost:5000/api/students/${user._id}/view-college`, { collegeId: college._id })
        .catch(err => console.error(err));
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!user || user.role !== 'student') return;
    try {
      const res = await axios.post(`http://localhost:5000/api/students/${user._id}/save-college`, { collegeId: college._id });
      if (res.data.success) {
        onSaveToggle(college._id, res.data.data);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <motion.div className="college-card" variants={cardVariant} layout>
      <div className="college-card-main" onClick={toggleExpand}>
        {/* Left accent */}
        <div className="college-card-accent" />

        <div className="college-card-body">
          {/* Top row: name + badges */}
          <div className="college-card-top" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {college.logo && (
              <div className="college-logo-container" style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-light, #e2e8f0)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <img src={college.logo} alt={`${college.college_short_name || 'College'} Logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
              </div>
            )}
            <div className="college-card-info" style={{ flex: 1 }}>
              <h3 className="college-name">{college.college_name}</h3>
              {college.college_short_name && (
                <span className="college-short-name">{college.college_short_name}</span>
              )}
            </div>
            <div className="college-badges">
              <CollegeTypeBadge type={college.college_type} />
              {college.naac_grade && (
                <span className={`naac-badge ${naacColor(college.naac_grade)}`}>
                  <FiStar size={12} />
                  NAAC {college.naac_grade}
                </span>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="college-meta">
            {college.city && (
              <span className="meta-item">
                <FiMapPin size={14} />
                {college.city}{college.district && college.district !== college.city ? `, ${college.district}` : ''}
              </span>
            )}
            {college.university_name && (
              <span className="meta-item">
                <FiBook size={14} />
                {college.university_name}
              </span>
            )}
            {college.established_year && (
              <span className="meta-item">
                <FiCalendar size={14} />
                Est. {college.established_year}
              </span>
            )}
          </div>

          {/* Cutoff pills removed from UI (handled by AI) */}

          {(!user || user.role === 'student') && (
            <button 
              onClick={handleSaveToggle} 
              className="college-save-btn" 
              aria-label="Save college"
            >
              <FiBookmark size={18} fill={isSaved ? '#ea580c' : 'none'} color={isSaved ? '#ea580c' : '#64748b'} />
            </button>
          )}

          {/* Expand toggle */}
          <button className="college-expand-btn" aria-label="Toggle details">
            <FiChevronDown
              size={18}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.3s ease',
              }}
            />
          </button>
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="college-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.25 } }}
          >
            <div className="college-expanded-inner">
              {/* Tabs */}
              <div className="college-tabs">
                <button 
                  className={`college-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <FiLayers size={14} /> Details
                </button>
                <button 
                  className={`college-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <FiMessageSquare size={14} /> Ask AI
                </button>
              </div>

              {activeTab === 'details' && (
                <>
                  {/* Contact & Links */}
                  <div className="expanded-section">
                    <h4 className="expanded-title"><FiGlobe size={16} /> Contact & Links</h4>
                    <div className="expanded-links">
                      {college.website && (
                        <a href={college.website} target="_blank" rel="noreferrer" className="expanded-link">
                          <FiExternalLink size={14} /> Website
                        </a>
                      )}
                      {college.email && (
                        <a href={`mailto:${college.email}`} className="expanded-link">
                          <FiMail size={14} /> {college.email}
                        </a>
                      )}
                      {college.address && (
                        <span className="expanded-address">
                          <FiMapPin size={14} /> {college.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Courses */}
                  {hasCourses && (
                    <div className="expanded-section">
                      <h4 className="expanded-title"><FiLayers size={16} /> Courses Offered</h4>
                      <div className="courses-grid">
                        {courses.map((cr, i) => (
                          <div key={i} className="course-chip">
                            <span className="course-chip-name">
                              {cr.course_name}
                              {cr.specialization ? ` — ${cr.specialization}` : ''}
                            </span>
                            {cr.duration_years && (
                              <span className="course-chip-dur">{cr.duration_years}yr</span>
                            )}
                          </div>
                        ))}
                        {college.courses.length > 8 && (
                          <div className="course-chip course-chip-more">
                            +{college.courses.length - 8} more courses
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detailed cutoffs removed from UI (handled by AI) */}

                  {college.remarks && (
                    <div className="expanded-remarks">
                      <FiZap size={14} /> {college.remarks}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'chat' && (
                <div className="college-chat-container">
                  <div className="chat-messages" ref={chatScrollRef}>
                    {messages.length === 0 ? (
                      <div className="chat-empty">
                        <FiMessageSquare size={24} className="chat-empty-icon" />
                        <p>Ask me anything about <strong>{college.college_name}</strong>!</p>
                      </div>
                    ) : (
                      messages.map((msg, i) => (
                        <div key={i} className={`chat-message ${msg.role}`}>
                          <div className="chat-bubble">{msg.content}</div>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="chat-message ai">
                        <div className="chat-bubble typing">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input 
                      type="text" 
                      placeholder="e.g. What are the placement statistics?" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                    />
                    <button type="submit" disabled={chatLoading || !chatInput.trim()}>
                      <FiSend size={16} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CollegeSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [search, setSearch] = useState(() => {
    return new URLSearchParams(window.location.search).get('search') || '';
  });
  const [city, setCity] = useState('');
  const [course, setCourse] = useState('');
  const [collegeType, setCollegeType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedCollegeIds, setSavedCollegeIds] = useState(new Set());

  // Options from API
  const [cities, setCities] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const searchTimeout = useRef(null);
  const resultsRef = useRef(null);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [citiesRes, coursesRes, typesRes] = await Promise.all([
          axios.get(`${API}/cities`),
          axios.get(`${API}/courses`),
          axios.get(`${API}/types`),
        ]);
        setCities(citiesRes.data.data || []);
        setCourseOptions(coursesRes.data.data || []);
        setTypeOptions(typesRes.data.data || []);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchOptions();

    // Fetch user's saved colleges (only for students)
    if (user?._id && user.role === 'student') {
      axios.get(`http://localhost:5000/api/students/${user._id}/dashboard-data`)
        .then(res => {
          if (res.data.success && res.data.data.savedColleges) {
            const ids = res.data.data.savedColleges.map(c => typeof c === 'string' ? c : c._id);
            setSavedCollegeIds(new Set(ids));
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  // Fetch colleges
  const fetchColleges = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (city) params.city = city;
      if (course) params.course = course;
      if (collegeType) params.collegeType = collegeType;
      if (user?.category) params.category = user.category;

      const res = await axios.get(API, { params });
      setColleges(res.data.data || []);
      setTotalResults(res.data.total || 0);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Search failed:', err);
      setColleges([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [search, city, course, collegeType, user?.category]);

  // On filter change — debounce search, instant for dropdowns
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchColleges(1);
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [search, city, course, collegeType, fetchColleges]);

  // Initial fetch
  useEffect(() => {
    fetchColleges(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchColleges(newPage);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setCourse('');
    setCollegeType('');
  };

  const activeFilterCount = [city, course, collegeType].filter(Boolean).length;

  return (
    <div className="search-page">
      <div className="search-shell">
        {/* Header */}
        <motion.header className="search-header" {...fadeUp(0)}>
          <div className="search-header-left">
            <Link to="/dashboard" className="search-back-btn">
              <FiArrowLeft size={18} />
            </Link>
          </div>
        </motion.header>

        {/* Hero search area */}
        <motion.div className="search-hero" {...fadeUp(0.1)}>
          <h1 className="search-hero-title">
            Discover Your <span className="gradient-text">Dream College</span>
          </h1>
          <p className="search-hero-sub">
            Search from <strong>{totalResults > 0 ? totalResults : '480+'}</strong> colleges across Maharashtra — filter by city, course, and type
          </p>

          {/* Search bar */}
          <div className="search-bar-wrap">
            <div className="search-bar">
              <FiSearch size={20} className="search-bar-icon" />
              <input
                id="college-search-input"
                type="text"
                className="search-bar-input"
                placeholder="Search college name, university..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button className="search-clear-btn" onClick={() => setSearch('')}>
                  <FiX size={16} />
                </button>
              )}
            </div>

            <button
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={18} />
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-count">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="filter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
              >
                <div className="filter-panel-inner">
                  <div className="filter-group">
                    <label className="filter-label">
                      <FiMapPin size={15} /> City
                    </label>
                    <div className="select-wrap">
                      <select
                        id="filter-city"
                        className="form-select filter-select"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option value="">All Cities</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="select-arrow">▾</span>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">
                      <FiBook size={15} /> Course
                    </label>
                    <div className="select-wrap">
                      <select
                        id="filter-course"
                        className="form-select filter-select"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                      >
                        <option value="">All Courses</option>
                        {courseOptions.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="select-arrow">▾</span>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">
                      <FiHome size={15} /> College Type
                    </label>
                    <div className="select-wrap">
                      <select
                        id="filter-type"
                        className="form-select filter-select"
                        value={collegeType}
                        onChange={(e) => setCollegeType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        {typeOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="select-arrow">▾</span>
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button className="filter-clear-btn" onClick={clearFilters}>
                      <FiX size={14} /> Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <motion.div className="active-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {city && (
                <span className="active-chip">
                  <FiMapPin size={12} /> {city}
                  <button onClick={() => setCity('')}><FiX size={12} /></button>
                </span>
              )}
              {course && (
                <span className="active-chip">
                  <FiBook size={12} /> {course}
                  <button onClick={() => setCourse('')}><FiX size={12} /></button>
                </span>
              )}
              {collegeType && (
                <span className="active-chip">
                  <FiHome size={12} /> {collegeType}
                  <button onClick={() => setCollegeType('')}><FiX size={12} /></button>
                </span>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        <div className="search-results" ref={resultsRef}>
          {/* Results header */}
          <motion.div className="results-header" {...fadeUp(0.15)}>
            <span className="results-count">
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <strong>{totalResults}</strong> college{totalResults !== 1 ? 's' : ''} found
                </>
              )}
            </span>
            {user?.category && (
              <span className="results-category-note">
                Showing cutoffs for <strong>{user.category}</strong> category
              </span>
            )}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="search-loading">
              <div className="search-loader">
                <div className="loader" />
                <p>Finding the best colleges for you...</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && colleges.length === 0 && (
            <motion.div className="search-empty" {...fadeUp(0)}>
              <div className="empty-icon">🔍</div>
              <h3>No colleges found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn btn-ghost" onClick={clearFilters}>
                Clear all filters
              </button>
            </motion.div>
          )}

          {/* College cards */}
          {!loading && colleges.length > 0 && (
            <motion.div className="college-list" variants={stagger} initial="initial" animate="animate">
              {colleges.map((college, i) => (
                <CollegeCard 
                  key={`${college.college_name}-${i}`} 
                  college={college} 
                  index={i} 
                  user={user} 
                  isSaved={savedCollegeIds.has(college._id)}
                  onSaveToggle={(id, newSavedArray) => setSavedCollegeIds(new Set(newSavedArray))}
                />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <motion.div className="pagination" {...fadeUp(0)}>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <FiChevronLeft size={18} />
              </button>

              <div className="pagination-pages">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-page ${pageNum === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <FiChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
