import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiBookOpen, FiTarget, FiAward, FiUsers, FiSettings, FiActivity, FiBriefcase, FiChevronDown, FiChevronUp, FiMapPin, FiCalendar, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } },
});

const topColleges = [
  { name: 'College of Engineering, Pune', short: 'COEP', location: 'Pune, Maharashtra', img: '/coep-logo.png', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { name: 'Veermata Jijabai Technological Institute', short: 'VJTI', location: 'Mumbai, Maharashtra', img: '/vjti-logo.png', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { name: 'Sardar Patel Institute of Technology', short: 'SPIT', location: 'Mumbai, Maharashtra', img: '/spit-logo.png', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { name: 'Pune Institute of Computer Technology', short: 'PICT', location: 'Pune, Maharashtra', img: '/pict-logo.png', gradient: 'linear-gradient(135deg, #10b981, #047857)' }
];

const topUniversities = [
  {
    name: 'University of Mumbai',
    logo: '🎓',
    location: 'Mumbai, Maharashtra',
    established: '1857',
    type: 'State Public University',
    naac: 'A++',
    website: 'https://mu.ac.in'
  },
  {
    name: 'Savitribai Phule Pune University (SPPU)',
    logo: '🎓',
    location: 'Pune, Maharashtra',
    established: '1949',
    type: 'State Public University',
    naac: 'A++',
    website: 'https://www.unipune.ac.in'
  },
  {
    name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
    logo: '🎓',
    location: 'Nagpur, Maharashtra',
    established: '1923',
    type: 'State Public University',
    naac: 'A',
    website: 'https://nagpuruniversity.ac.in'
  },
  {
    name: 'Bharati Vidyapeeth (Deemed to be University)',
    logo: '🎓',
    location: 'Pune, Maharashtra',
    established: '1964',
    type: 'Deemed University',
    naac: 'A++',
    website: 'https://www.bvuniversity.edu.in'
  }
];

const academicPaths = [
  {
    category: 'Engineering',
    paths: [
      { title: 'ENGINEERING (B.E / B.TECH)', institutes: 'Top Institutes: IITs, NITs, COEP, VJTI', icon: <FiSettings />, exams: [{ name: 'JEE Main', desc: 'National level for NITs/IIITs. Jan & April sessions.' }, { name: 'MHT-CET', desc: 'Maharashtra state level. Focus on PCM.' }, { name: 'JEE Advanced', desc: 'For IIT admission. Only for JEE Main toppers.' }] },
      { title: 'ARCHITECTURE (B.ARCH)', institutes: 'Top Institutes: SPA Delhi, CEPT, NIT Trichy', icon: <FiBookOpen />, exams: [{ name: 'NATA', desc: 'National Aptitude Test in Architecture.' }, { name: 'JEE Main Paper 2', desc: 'For B.Arch in NITs/SPAs.' }] }
    ]
  },
  {
    category: 'Medical & Pharma',
    paths: [
      { title: 'MBBS / BDS', institutes: 'Government & Private Medical Colleges across India', icon: <FiActivity />, exams: [{ name: 'NEET UG', desc: 'National level medical entrance exam.' }] },
      { title: 'PHARMACY (B.PHARM)', institutes: 'Healthcare and Pharmaceutical Research', icon: <FiTarget />, exams: [{ name: 'MHT-CET (PCB)', desc: 'State level exam for Pharmacy.' }] }
    ]
  },
  {
    category: 'Specialized',
    paths: [
      { title: 'LAW (BA LLB / BBA LLB)', institutes: 'NLUs, Government Law Colleges, Private Institutions', icon: <FiBriefcase />, exams: [{ name: 'CLAT', desc: 'Common Law Admission Test for NLUs.' }, { name: 'MH CET Law', desc: 'State level law entrance.' }] },
      { title: 'MANAGEMENT (BMS / BBA / MBA)', institutes: 'IIMs, SPJIMR, Symbiosis, MIT-WPU', icon: <FiUsers />, exams: [{ name: 'CAT / MAH-MBA CET', desc: 'For postgraduate management programs.' }] },
      { title: 'AGRICULTURE & FORESTRY', institutes: 'B.Sc. Hons in Agri, Horticulture, Forestry', icon: <FiAward />, exams: [{ name: 'MHT-CET (Agri)', desc: 'State level agriculture entrance.' }, { name: 'ICAR AIEEA', desc: 'National level agriculture exam.' }] }
    ]
  }
];

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All Streams');
  const [expandedPath, setExpandedPath] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (shortName) => {
    setImageErrors(prev => ({ ...prev, [shortName]: true }));
  };

  const getFilteredPaths = () => {
    if (activeTab === 'All Streams') {
      return academicPaths.flatMap(cat => cat.paths);
    }
    const category = academicPaths.find(cat => cat.category === activeTab);
    return category ? category.paths : [];
  };

  const toggleExpand = (title) => {
    setExpandedPath(expandedPath === title ? null : title);
  };

  return (
    <div className="home-page">
      {/* Trendy Hero Section */}
      <section className="hero-dark">
        <div className="hero-content">
          <motion.h1 className="hero-title-trendy" {...fadeUp(0.1)}>
            Find Your Perfect College.<br />
            <span className="gradient-text-trendy">Build Your Future.</span>
          </motion.h1>

          <motion.p className="hero-subtitle-trendy" {...fadeUp(0.2)}>
            Explore colleges, compare cutoffs, discover career paths, and make confident admission decisions with real data.
          </motion.p>

          <motion.div className="hero-actions-trendy" {...fadeUp(0.3)}>
            {user ? (
              <Link to="/search" className="btn btn-gradient-orange btn-lg">
                EXPLORE COLLEGES <FiArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-gradient-orange btn-lg">
                  START YOUR SEARCH NOW 🚀
                </Link>
                <Link to="/login" className="btn btn-ghost-dark btn-lg">
                  GUIDE ME
                </Link>
              </>
            )}
          </motion.div>
        </div>

        <motion.div className="hero-images" {...fadeUp(0.4)}>
          <div className="img-col img-col-1">
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400" alt="Students" className="hero-img" />
          </div>
          <div className="img-col img-col-2">
            <img src="https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&q=80&w=400" alt="College Campus" className="hero-img" />
          </div>
          <div className="img-col img-col-3">
            <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400" alt="Studying" className="hero-img" />
          </div>
        </motion.div>
      </section>

      {/* Top Colleges Section */}
      <section className="top-colleges-section">
        <motion.div className="section-header-center" {...fadeUp(0)}>
          <h2 className="section-title-trendy">Top Colleges of Maharashtra</h2>
        </motion.div>

        <div className="college-cards-grid">
          {topColleges.map((college, i) => (
            <motion.div className="college-partner-card" key={i} {...fadeUp(i * 0.1)}>
              <div className="college-partner-img">
                {imageErrors[college.short] ? (
                  <div className="college-logo-placeholder" style={{ background: college.gradient }}>
                    {college.short}
                  </div>
                ) : (
                  <img 
                    src={college.img} 
                    alt={college.short} 
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(college.short)}
                  />
                )}
              </div>
              <div className="college-partner-name">
                {college.short} ({college.location.split(',')[0].toUpperCase()})
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Universities Section */}
      <section className="top-universities-section">
        <motion.div className="section-header-center" {...fadeUp(0)}>
          <h2 className="section-title-trendy">Top Universities</h2>
          <p className="section-subtitle-trendy">
            Explore Maharashtra's leading universities known for academic excellence, research and industry connections.
          </p>
        </motion.div>

        <motion.div className="universities-grid" {...fadeUp(0.2)}>
          {topUniversities.map((uni, i) => (
            <div className="university-card" key={i}>
              <div>
                <div className="uni-card-header">
                  <div className="uni-card-logo-wrap">
                    <span className="uni-card-icon">{uni.logo}</span>
                  </div>
                  <div className="uni-card-meta-top">
                    <span className="uni-badge-type">{uni.type}</span>
                  </div>
                </div>
                
                <div className="uni-card-body">
                  <h3 className="uni-card-title">{uni.name}</h3>
                  
                  <div className="uni-details-list">
                    <div className="uni-detail-item">
                      <FiMapPin size={16} className="uni-icon-orange" />
                      <span>{uni.location}</span>
                    </div>
                    <div className="uni-detail-item">
                      <FiCalendar size={16} className="uni-icon-orange" />
                      <span>Established: {uni.established}</span>
                    </div>
                    <div className="uni-detail-item">
                      <FiAward size={16} className="uni-icon-orange" />
                      <span>NAAC Grade: <strong className="naac-highlight">{uni.naac}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="uni-card-footer">
                <a href={uni.website} target="_blank" rel="noopener noreferrer" className="btn-visit-uni">
                  Visit Website <FiExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Trending Academic Paths */}
      <section className="trending-paths-section">
        <motion.div className="section-header-center" {...fadeUp(0)}>
          <h2 className="section-title-trendy">Trending Academic Paths</h2>
          <p className="section-subtitle-trendy">Explore hot career fields, top institutes, and entrance exam requirements.</p>
        </motion.div>

        <motion.div className="path-tabs" {...fadeUp(0.1)}>
          <button className={`path-tab ${activeTab === 'All Streams' ? 'active' : ''}`} onClick={() => setActiveTab('All Streams')}>All Streams</button>
          <button className={`path-tab ${activeTab === 'Engineering' ? 'active' : ''}`} onClick={() => setActiveTab('Engineering')}>Engineering</button>
          <button className={`path-tab ${activeTab === 'Medical & Pharma' ? 'active' : ''}`} onClick={() => setActiveTab('Medical & Pharma')}>Medical & Pharma</button>
          <button className={`path-tab ${activeTab === 'Specialized' ? 'active' : ''}`} onClick={() => setActiveTab('Specialized')}>Specialized</button>
        </motion.div>

        <div className="paths-list">
          {getFilteredPaths().map((path, i) => (
            <motion.div className="path-card" key={i} {...fadeUp(0.2 + (i * 0.05))}>
              <div className="path-card-header" onClick={() => toggleExpand(path.title)}>
                <div className="path-icon-wrap">{path.icon}</div>
                <div className="path-info">
                  <h3 className="path-title">{path.title}</h3>
                  <p className="path-institutes">{path.institutes}</p>
                </div>
                <button className="path-expand-btn">
                  {expandedPath === path.title ? 'Hide Entrance Details' : 'View Entrance Details'}
                  {expandedPath === path.title ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
                </button>
              </div>

              <AnimatePresence>
                {expandedPath === path.title && (
                  <motion.div
                    className="path-card-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="exams-grid">
                      {path.exams.map((exam, j) => (
                        <div className="exam-detail-card" key={j}>
                          <strong className="exam-name">{exam.name}:</strong> <span className="exam-desc">{exam.desc}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section className="cta-section-trendy" {...fadeUp(0)}>
        <div className="cta-card-trendy">
          <h2>Ready to find your dream college?</h2>
          <p>Join thousands of students who've already discovered their perfect match.</p>
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-gradient-orange btn-lg">
            {user ? 'View Dashboard' : 'Start Your Journey'} <FiArrowRight size={20} />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
