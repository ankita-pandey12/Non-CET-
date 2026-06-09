import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTarget, FiAward, FiHeart } from 'react-icons/fi';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } },
});

export default function AboutUs() {
  return (
    <div className="about-page" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Hero Section */}
      <motion.div style={{ textAlign: 'center', marginBottom: '5rem' }} {...fadeUp(0)}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-amber) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          About CollegePredictor
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          We are on a mission to simplify the college admission journey for thousands of students across the country. Make informed decisions with confidence.
        </p>
      </motion.div>

      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        {[
          { label: 'Colleges', value: '500+', icon: <FiAward size={24} /> },
          { label: 'Students Helped', value: '10,000+', icon: <FiUsers size={24} /> },
          { label: 'Courses Tracked', value: '1,200+', icon: <FiTarget size={24} /> },
          { label: 'Success Rate', value: '98%', icon: <FiHeart size={24} /> },
        ].map((stat, i) => (
          <motion.div key={i} {...fadeUp(0.1 + i * 0.1)} style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', textAlign: 'center', border: '1px solid var(--border-default)', boxShadow: '0 4px 20px var(--shadow-sm)' }}>
            <div style={{ width: '50px', height: '50px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-orange)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              {stat.icon}
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{stat.value}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
        <motion.div {...fadeUp(0.5)}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: '1.2' }}>Empowering Students Through Data</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
            Choosing the right college is one of the most critical decisions in a student's life. We realized that information about colleges, streams, and cutoffs was scattered and hard to decipher.
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            CollegePredictor brings all of this data under one beautifully designed roof. Our intelligent algorithms match your academic profile with historical trends to predict your best options, saving you countless hours of research.
          </p>
        </motion.div>
        
        <motion.div {...fadeUp(0.6)} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-10%', background: 'radial-gradient(circle at center, rgba(249,115,22,0.15) 0%, transparent 70%)', zIndex: -1, borderRadius: '50%' }} />
          <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '2rem', border: '1px solid var(--border-default)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTarget color="var(--accent-orange)" /> Our Vision
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Democratize access to college admission data',
                'Provide personalized, accurate college predictions',
                'Build a community of informed students and parents',
                'Integrate AI to answer complex admission queries instantly'
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <div style={{ marginTop: '4px', color: 'var(--success)' }}><FiCheckCircle /></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Small helper for the checkmark
function FiCheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
