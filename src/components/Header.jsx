import React from 'react';
import { Zap, Wallet, LogOut } from 'lucide-react';

const shortenAddress = (addr) => {
  if (!addr) return '';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
};

const Header = ({ publicKey, walletName, isConnected, connecting, onConnect, onDisconnect }) => {
  return (
    <header className="header-glow sticky top-0 z-40">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
          }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <div>
            <h1 className="glow-text" style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
              FundFlow
            </h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Stellar Testnet
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div style={{ alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: isConnected ? 'flex' : 'none' }}>

          <div className="pulse-dot" style={{ background: 'var(--color-success)' }} />
          <span>Live</span>
        </div>

        {/* Wallet Button */}
        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              padding: '0.5rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.875rem',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
              {walletName && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, color: '#a5b4fc',
                  background: 'rgba(99,102,241,0.15)', borderRadius: '4px', padding: '1px 5px',
                }}>{walletName}</span>
              )}
              <span style={{ color: 'var(--color-text-secondary)' }}>{shortenAddress(publicKey)}</span>
            </div>
            <button
              onClick={onDisconnect}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '0.75rem',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Disconnect"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onConnect} disabled={connecting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Wallet size={16} />
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
