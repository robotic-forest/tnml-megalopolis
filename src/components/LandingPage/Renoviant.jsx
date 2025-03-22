import React, { useState, useEffect } from 'react';
// import './Renoviant.css';

const Renoviant = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Optional: Add scroll animation listener for additional sections
    const handleScroll = () => {
      // Add scroll-based animations if needed
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="renoviant-container">
      {/* Hero Section with Gradient Background */}
      <section className="hero-section">
        <div className={`content-wrapper ${isVisible ? 'visible' : ''}`}>
          <h1 className="hero-title">Renoviant</h1>
          <p className="hero-subtitle">Transforming Ideas into Digital Experiences</p>
          <div className="cta-container">
            <button className="cta-primary">Get Started</button>
            <button className="cta-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-graphics">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Our Solutions</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon innovative"></div>
            <h3>Innovative Design</h3>
            <p>Creating unique digital experiences that captivate and engage your audience.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon scalable"></div>
            <h3>Scalable Solutions</h3>
            <p>Building systems that grow with your business and adapt to changing needs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon secure"></div>
            <h3>Secure Architecture</h3>
            <p>Implementing robust security practices to protect your valuable data.</p>
          </div>
        </div>
      </section>

      {/* About Section with Gradient */}
      <section className="about-section">
        <div className="about-content">
          <h2 className="section-title">About Renoviant</h2>
          <p className="about-text">
            At Renoviant, we specialize in transforming complex ideas into elegant digital solutions. 
            Our team of experts combines technical excellence with creative vision to deliver 
            outstanding results for our clients.
          </p>
          <p className="about-text">
            With years of industry experience, we've helped businesses of all sizes achieve their 
            digital transformation goals and create meaningful connections with their users.
          </p>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonial-container">
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Renoviant transformed our outdated systems into a sleek, modern platform that 
              our customers love. Their attention to detail and commitment to quality is unmatched."
            </p>
            <p className="testimonial-author">- Sarah Johnson, CEO</p>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Working with the Renoviant team was a game-changer for our business. 
              They understood our vision and delivered beyond our expectations."
            </p>
            <p className="testimonial-author">- Michael Chen, CTO</p>
          </div>
        </div>
      </section>

      {/* Contact Section with Gradient */}
      <section className="contact-section">
        <div className="contact-content">
          <h2 className="section-title">Get in Touch</h2>
          <p className="contact-text">
            Ready to start your next project? Contact us today to discover how Renoviant 
            can help bring your vision to life.
          </p>
          <form className="contact-form">
            <div className="form-group">
              <input type="text" placeholder="Your Name" />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message"></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">Renoviant</div>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="social-links">
            <a href="#" className="social-icon">
              <i className="icon-facebook"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="icon-twitter"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="icon-linkedin"></i>
            </a>
          </div>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} Renoviant. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Renoviant;