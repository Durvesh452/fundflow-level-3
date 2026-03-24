import React from 'react';
import { fromStroops } from '../utils/stellar';

const ProgressBar = ({ totalRaised, goal }) => {
  const raisedNum = Number(totalRaised ?? 0n);
  const goalNum = Number(goal ?? 1n);
  const pct = Math.min((raisedNum / goalNum) * 100, 100).toFixed(1);

  const milestones = [25, 50, 75, 100];

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Campaign Progress
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {pct}% funded — keep it going! 🚀
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.125rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Goal</p>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {fromStroops(goal)} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>XLM</span>
          </p>
        </div>
      </div>

      {/* Bar */}
      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        {/* Milestone markers */}
        {milestones.map((m) => (
          <div key={m} style={{
            position: 'absolute',
            top: '50%',
            left: `${m}%`,
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '16px',
            background: parseFloat(pct) >= m ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            transition: 'background 0.5s ease',
          }} />
        ))}
      </div>

      {/* Raised Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Raised</span>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#8b5cf6' }}>
            {fromStroops(totalRaised)} XLM
          </span>
        </div>
        <div style={{
          background: parseFloat(pct) === 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
          border: `1px solid ${parseFloat(pct) === 100 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
          borderRadius: '9999px',
          padding: '0.25rem 0.875rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: parseFloat(pct) === 100 ? 'var(--color-success)' : '#a5b4fc',
        }}>
          {pct}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
