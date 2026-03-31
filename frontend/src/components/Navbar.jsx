import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="landing-nav"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Shield size={26} />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          GigShield <span style={{ color: 'rgba(167, 243, 208, 0.95)' }}>AI</span>
        </span>
      </div>
      
      <div className="landing-nav-links">
        <a href="#analytics">Analytics</a>
        <a href="#rider-showcase">Community</a>
        <a href="#pricing">Plans</a>
        <a href="#fraud">Security</a>
        <Link to="/auth" className="landing-nav-cta">Analyze My Risk</Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
