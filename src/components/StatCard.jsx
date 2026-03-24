import React, { useEffect, useRef } from 'react';

const StatCard = ({ icon, label, value, sub, accentColor = '#6366f1' }) => {
  const valueRef = useRef(null);

  return (
    <div className="stat-card" style={{ '--accent-color': accentColor }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${accentColor}20`,
          border: `1px solid ${accentColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor, fontSize: '1.25rem',
        }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p className="number-counter" ref={valueRef} style={{
        margin: '0 0 0.25rem',
        fontSize: '1.875rem',
        fontWeight: 800,
        color: 'var(--color-text-primary)',
        lineHeight: 1.1,
      }}>
        {value}
      </p>
      {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{sub}</p>}
    </div>
  );
};

export default StatCard;
