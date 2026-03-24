import React from 'react';
import { Activity, Heart } from 'lucide-react';
import { fromStroops } from '../utils/stellar';

const shortenAddress = (addr) => {
  if (!addr) return 'Unknown';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const timeAgo = (date) => {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
};

const ActivityFeed = ({ items, isConnected }) => {
  return (
    <div className="card" style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Activity size={18} color="var(--color-accent)" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Activity Feed</h3>
        </div>
        {items.length > 0 && (
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '9999px',
            padding: '0.125rem 0.625rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#a5b4fc',
          }}>
            {items.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="scrollbar-thin" style={{ overflowY: 'auto', maxHeight: '320px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
            <Heart size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3, display: 'block' }} />
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>No donations yet</p>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>
              {isConnected ? 'Be the first to support this campaign!' : 'Connect your wallet to donate'}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="activity-item">
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: 'white',
              }}>
                {item.address ? item.address.slice(0, 2) : '??'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 0.125rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shortenAddress(item.address)}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {timeAgo(item.time)}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  +{fromStroops(item.amount)} XLM
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
