import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Star } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "99",
      desc: "Essential protection",
      features: ["Rainfall > 50mm", "15% Payout", "UPI Instant"],
      color: "#94a3b8"
    },
    {
      name: "Pro",
      price: "149",
      desc: "Full shield",
      features: ["Weather + AQI", "30% Payout", "Fraud Shield", "Priority Support"],
      color: "#6366f1",
      popular: true
    },
    {
      name: "Elite",
      price: "199",
      desc: "Ultimate security",
      features: ["All Triggers", "40% Payout", "Accident Cover", "Weekly Reports"],
      color: "#06b6d4"
    }
  ];

  return (
    <section id="pricing" style={{ padding: '100px 5%' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Flexible <span className="gradient-text">Weekly</span> Plans</h2>
        <p style={{ color: '#94a3b8' }}>Cancel anytime. No long-term commitments.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="glass-card"
            style={{ 
              padding: '32px', 
              border: plan.popular ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              position: 'relative'
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800 }}>
                MOST POPULAR
              </div>
            )}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>{plan.name}</h3>
            <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>₹{plan.price}<span style={{ fontSize: '1rem', color: '#475569' }}>/wk</span></div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '2rem' }}>{plan.desc}</p>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <Check size={16} style={{ color: '#10b981' }} /> {f}
                </li>
              ))}
            </ul>

            <button style={{ width: '100%', padding: '14px', borderRadius: '10px', background: plan.popular ? '#6366f1' : 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Select Plan
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
