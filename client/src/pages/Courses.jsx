import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX, FiSettings, FiActivity, FiBriefcase, FiLayers, FiUsers, FiAward, FiCpu, FiBookOpen, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Home.css';
import './Courses.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] } },
});

// Exam official websites mapping
const examWebsites = {
  'jee main': 'https://jeemain.nta.ac.in/',
  'jee advanced': 'https://jeeadv.ac.in/',
  'mht-cet': 'https://cetcell.mahacet.org/',
  'neet ug': 'https://neet.nta.nic.in/',
  'clat': 'https://consortiumofnlus.ac.in/',
  'mh cet law': 'https://cetcell.mahacet.org/',
  'mah bca cet': 'https://cetcell.mahacet.org/',
  'mah bba cet': 'https://cetcell.mahacet.org/',
  'nata': 'https://www.nata.in/',
  'icar aieea': 'https://icar.nta.nic.in/',
  'set': 'https://www.set-test.org/',
  'npat': 'https://www.npat.in/',
  'cuet': 'https://cuet.samarth.ac.in/'
};

// Category definition for horizontal tabs
const categories = [
  { id: 'all', name: 'All', dbCategories: [] },
  { id: 'engineering', name: 'Engineering', dbCategories: ['Engineering & Technology'] },
  { id: 'medical', name: 'Medical', dbCategories: ['Medical & Health Sciences', 'Pharmacy & Healthcare'] },
  { id: 'commerce', name: 'Commerce', dbCategories: ['Commerce', 'Management & Business'] },
  { id: 'science', name: 'Science', dbCategories: ['Science', 'Computer Applications & IT'] },
  { id: 'law', name: 'Law', dbCategories: ['Law'] },
  { id: 'agriculture', name: 'Agriculture', dbCategories: ['Agriculture & Allied Sciences'] }
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/courses');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter logic
  const filteredCourses = courses.filter((course) => {
    // 1. Search Query filter (matches name, category, exams, or career paths)
    const matchesSearch = searchQuery.trim() === '' || 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.entranceExams && course.entranceExams.some(exam => exam.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (course.careerPaths && course.careerPaths.some(career => career.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    // 2. Category Tab filter
    if (selectedCategoryId && selectedCategoryId !== 'all') {
      const selectedCatObj = categories.find(c => c.id === selectedCategoryId);
      if (selectedCatObj) {
        return selectedCatObj.dbCategories.includes(course.category);
      }
    }

    return true;
  });

  return (
    <div className="courses-page-container">
      {/* Premium Hero Section */}
      <motion.div className="courses-hero-card" {...fadeUp(0.1)}>
        <h1 className="courses-hero-title">
          Explore <span className="gradient-text-trendy">Courses & Careers</span>
        </h1>
        <p className="courses-hero-subtitle">
          Discover undergraduate programs, eligibility criteria, entrance exams, top colleges and career opportunities.
        </p>

        {/* Search bar */}
        <div className="search-bar-wrap" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
          <div className="search-bar">
            <FiSearch size={20} className="search-bar-icon" />
            <input
              id="course-search-input"
              type="text"
              className="search-bar-input"
              placeholder="Search courses, careers or entrance exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')} style={{ right: '20px' }}>
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="courses-stats-row">
          <div className="course-stat-item">
            <span className="course-stat-value">13+</span>
            <span className="course-stat-label">Courses</span>
          </div>
          <div className="course-stat-divider" />
          <div className="course-stat-item">
            <span className="course-stat-value">50+</span>
            <span className="course-stat-label">Career Paths</span>
          </div>
          <div className="course-stat-divider" />
          <div className="course-stat-item">
            <span className="course-stat-value">100+</span>
            <span className="course-stat-label">Colleges</span>
          </div>
          <div className="course-stat-divider" />
          <div className="course-stat-item">
            <span className="course-stat-value">15+</span>
            <span className="course-stat-label">Entrance Exams</span>
          </div>
        </div>
      </motion.div>

      {/* Horizontal Category Tabs */}
      <div className="path-tabs" style={{ marginBottom: '30px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`path-tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategoryId(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter Status Info */}
      {(selectedCategoryId !== 'all' || searchQuery) && (
        <div className="filter-results-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            Showing <strong>{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'course' : 'courses'}
            {selectedCategoryId !== 'all' && ` in ${categories.find(c => c.id === selectedCategoryId)?.name}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <button className="btn-clear-filter" onClick={() => { setSelectedCategoryId('all'); setSearchQuery(''); }}>
            Clear Filters <FiX size={14} />
          </button>
        </div>
      )}

      {/* Main Course Content */}
      <section className="featured-courses-section" style={{ borderTop: 'none', padding: 0 }}>
        {loading ? (
          <div className="search-loading" style={{ minHeight: '300px' }}>
            <div className="search-loader">
              <div className="loader" />
              <p>Loading courses...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredCourses.length === 0 ? (
              <div className="courses-empty-state">
                <div className="courses-empty-icon">🔍</div>
                <h3>No courses match your criteria</h3>
                <p>Try resetting the category filter or searching for a different term.</p>
              </div>
            ) : (
              <div className="courses-grid-saas">
                {filteredCourses.map((course, i) => (
                  <motion.div
                    className="saas-course-card"
                    key={course._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.03 }}
                  >
                    <div>
                      {/* Badge / Duration Header */}
                      <div className="course-card-header">
                        <span className="course-badge-category">{course.category}</span>
                        <span className="course-duration-pill">
                          <FiClock /> {course.duration} {course.duration === 1 ? 'Year' : 'Years'}
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="course-card-title">{course.name}</h3>
                      <div style={{ height: '1.5px', background: '#f1f5f9', margin: '15px 0' }} />

                      {/* Eligibility */}
                      <div className="course-detail-group">
                        <div className="course-detail-label">
                          <FiBookOpen size={13} /> Eligibility
                        </div>
                        <div className="course-detail-value">{course.eligibility || '10+2 passing marks'}</div>
                      </div>

                      {/* Entrance Exams */}
                      {course.entranceExams && course.entranceExams.length > 0 && (
                        <div className="course-detail-group">
                          <div className="course-detail-label">
                            <FiAward size={13} /> Top Entrance Exams
                          </div>
                          <div className="course-tags-wrap">
                            {course.entranceExams.map((exam, idx) => {
                              const examKey = exam.toLowerCase().trim();
                              const website = examWebsites[examKey];
                              if (website) {
                                return (
                                  <a 
                                    key={idx} 
                                    href={website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="course-tag exam"
                                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                                  >
                                    {exam}
                                  </a>
                                );
                              }
                              return (
                                <span key={idx} className="course-tag exam">
                                  {exam}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Career Paths */}
                      {course.careerPaths && course.careerPaths.length > 0 && (
                        <div className="course-detail-group" style={{ marginBottom: 0 }}>
                          <div className="course-detail-label">
                            <FiCpu size={13} /> Career Outcomes
                          </div>
                          <div className="course-tags-wrap">
                            {course.careerPaths.map((career, idx) => (
                              <span key={idx} className="course-career-item">
                                <FiCheck size={12} style={{ color: 'var(--success)' }} /> {career}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explore button */}
                    <div className="course-card-footer">
                      <Link to={`/search?course=${encodeURIComponent(course.name)}`} className="btn-explore-course">
                        Explore Colleges <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
