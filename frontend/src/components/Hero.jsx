import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Blobs */}
      <div className="blob" style={{ top: '10%', left: '5%' }}></div>
      <div className="blob" style={{ bottom: '10%', right: '5%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)' }}></div>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
        
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Protect Your Income <br />
            <span className="gradient-text">Automatically.</span>
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Parametric insurance that pays out instantly when weather or pollution hits your city. No complicated claim forms — just AI-powered protection.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', padding: '14px 32px', borderRadius: '100px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}
            >
              <Link to="/auth" style={{ color: "white", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Analyze My Risk <ArrowRight size={18} />
              </Link>
            </motion.div>
            
            <button style={{ background: 'transparent', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 28px', borderRadius: '100px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Play size={16} fill="white" /> See How It Works
            </button>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>50M+</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase' }}>Gig Workers</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹0</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase' }}>Claim Paperwork</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
          style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               style={{ fontSize: '6rem', marginBottom: '20px' }}>
               🛡️
             </motion.div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>AI Shield Active</h3>
             <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Continuously monitoring weather triggers across 500+ Indian districts.</p>
          </div>
          
          {/* Animated Circles around the shield */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '50%', zIndex: 1, animation: 'spin 20s linear infinite' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '90%', border: '1px solid rgba(6, 182, 212, 0.1)', borderRadius: '50%', zIndex: 1, animation: 'spin-reverse 15s linear infinite' }}></div>
        </motion.div>
      </div>
      
      <style>{`
        @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes spin-reverse { from { transform: translate(-50%, -50%) rotate(360deg); } to { transform: translate(-50%, -50%) rotate(0deg); } }
      `}</style>
    </section>
  );
};

export default Hero;
