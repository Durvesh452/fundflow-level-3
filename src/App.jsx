import React, { useState, useCallback } from 'react';
import { Target, Users, TrendingUp, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import StatCard from './components/StatCard';
import ProgressBar from './components/ProgressBar';
import ActivityFeed from './components/ActivityFeed';
import DonateForm from './components/DonateForm';
import WalletModal from './components/WalletModal';
import { useContract } from './hooks/useContract';
import { useWallet } from './hooks/useWallet';
import { fromStroops, submitDonation } from './utils/stellar';
import { CONFIG } from './config';

function App() {
  const { campaignData, activity, loading, error: contractError, refresh } = useContract();
  const {
    publicKey, walletName, isConnected, connecting,
    modalOpen, selectedWallet,
    openModal, closeModal, connectWallet, disconnect, signTransaction,
  } = useWallet();

  // Expose signTransaction for DonateForm
  window.__fundflow_sign = signTransaction;

  const handleDonated = useCallback(async (hash) => {
    // Immediately refresh after a successful donation
    await refresh();
  }, [refresh]);

  const goal = campaignData?.goal ?? BigInt(CONFIG.FUNDING_GOAL_XLM * 10_000_000);
  const totalRaised = campaignData?.total_raised ?? 0n;
  const donorCount = campaignData?.donor_count ?? 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ---- Wallet Selection Modal ---- */}
      <WalletModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSelect={connectWallet}
        connecting={connecting}
        selectedWallet={selectedWallet}
      />

      {/* ---- Header ---- */}
      <Header
        publicKey={publicKey}
        walletName={walletName}
        isConnected={isConnected}
        connecting={connecting}
        onConnect={openModal}
        onDisconnect={disconnect}
      />

      {/* ---- Hero Banner ---- */}
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem 1.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '9999px', padding: '0.375rem 1rem', marginBottom: '1.25rem',
          fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600,
        }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 6px var(--color-success)' }} />
          Live on Stellar Testnet
        </div>
        <h2 style={{
          margin: '0 0 0.875rem',
          fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
        }}>
          <span className="glow-text">Fund the Future</span>
          <br />
          <span style={{ color: 'var(--color-text-primary)' }}>of Decentralized Finance</span>
        </h2>
        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Power this campaign with XLM — every contribution is recorded on-chain, transparent, and immutable.
        </p>
      </div>

      {/* ---- Main Content ---- */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem 4rem' }}>

        {/* Loading state */}
        {loading && !campaignData && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            Connecting to Stellar network...
          </div>
        )}

        {/* Network error */}
        {contractError && !loading && (
          <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️</span>
            <div>
              <strong>Network Error:</strong> {contractError}.
              <br />
              <span style={{ fontSize: '0.8rem' }}>Auto-retrying every {CONFIG.POLL_INTERVAL / 1000}s...</span>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Total Raised"
            value={`${fromStroops(totalRaised)} XLM`}
            sub="Updated every 4 seconds"
            accentColor="#6366f1"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Total Donors"
            value={donorCount.toLocaleString()}
            sub="Unique contributors"
            accentColor="#8b5cf6"
          />
          <StatCard
            icon={<Target size={20} />}
            label="Funding Goal"
            value={`${fromStroops(goal)} XLM`}
            sub={`${CONFIG.FUNDING_GOAL_XLM.toLocaleString()} XLM Campaign`}
            accentColor="#06b6d4"
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar totalRaised={totalRaised} goal={goal} />

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          {/* Donate Form */}
          <div>
            <DonateForm
              publicKey={publicKey}
              isConnected={isConnected}
              onConnect={openModal}
              onDonated={handleDonated}
            />
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed items={activity} isConnected={isConnected} />
          </div>
        </div>

        {/* Footer hint */}
        <div style={{
          marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem',
          color: 'var(--color-text-secondary)', opacity: 0.6,
        }}>
          Polling contract every {CONFIG.POLL_INTERVAL / 1000}s · Built on Stellar Soroban
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          main > div:last-child > div:first-child { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  );
}

export default App;
