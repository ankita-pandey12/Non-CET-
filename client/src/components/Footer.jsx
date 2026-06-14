import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiPhone, FiMail } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-brand-section">
            <Link to="/" className="footer-logo">
              <img
                src="/logo.png"
                alt="Vidyarthi Mitra"
                className="footer-logo-img"
              />
            </Link>
            <p className="footer-tagline">
              Find your perfect college, explore career paths, and make informed admission decisions with intelligent predictions based on your academic profile.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="footer-links-section">
            <h4 className="footer-section-title">Quick Links</h4>
            <div className="footer-links-list">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/search" className="footer-link">Search Colleges</Link>
              <Link to="/courses" className="footer-link">Courses</Link>
              <Link to="/about" className="footer-link">About Us</Link>
            </div>
          </div>

          {/* Contact Us Column */}
          <div className="footer-contact-section">
            <h4 className="footer-section-title">Contact Us</h4>
            <div className="footer-contact-info">
              <a href="tel:7720025900" className="footer-contact-link">
                <FiPhone className="contact-icon" /> +91 77200 25900
              </a>
              <a href="tel:7720081400" className="footer-contact-link">
                <FiPhone className="contact-icon" /> +91 77200 81400
              </a>
              <a href="mailto:contact@vidyarthimitra.org" className="footer-contact-link">
                <FiMail className="contact-icon" /> contact@vidyarthimitra.org
              </a>
              <a href="mailto:info@vidyarthimitra.org" className="footer-contact-link">
                <FiMail className="contact-icon" /> info@vidyarthimitra.org
              </a>
            </div>
          </div>

          {/* Follow Us Column */}
          <div className="footer-follow-section">
            <h4 className="footer-section-title">Follow Us</h4>
            <div className="footer-social-links">
              <a href="https://www.facebook.com/VidyarthiMitra.org/" target="_blank" rel="noopener noreferrer" className="social-btn">
                <FiFacebook size={18} />
              </a>
              <a href="https://x.com/Vidyarthimitra" target="_blank" rel="noopener noreferrer" className="social-btn">
                <FiTwitter size={18} />
              </a>
              <a href="https://www.linkedin.com/in/vidyarthi-mitra/" target="_blank" rel="noopener noreferrer" className="social-btn">
                <FiLinkedin size={18} />
              </a>
              <a href="https://www.instagram.com/vidyarthi_mitra/" target="_blank" rel="noopener noreferrer" className="social-btn">
                <FiInstagram size={18} />
              </a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Vidyarthi Mitra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
