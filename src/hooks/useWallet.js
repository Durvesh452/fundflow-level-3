import { useState, useCallback, useEffect } from 'react';
import { CONFIG } from '../config';
import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';

export const useWallet = () => {
  const [publicKey, setPublicKey] = useState(null);
  const [walletName, setWalletName] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      StellarWalletsKit.init({
        network: Networks.TESTNET,
        selectedWalletId: 'freighter',
        modules: [
          new FreighterModule(),
          new AlbedoModule(),
          new xBullModule(),
        ],
      });
    } catch (e) {
      // Ignore inner init errors on re-mounts
    }
    
    // Expose sign transaction to global scope for DonateForm
    window.__fundflow_sign = async (xdr, opts) => {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr);
      return signedTxXdr;
    };
  }, []);

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (!connecting) setModalOpen(false);
  }, [connecting]);

  const connectWallet = useCallback(async (wallet) => {
    setConnecting(true);
    setSelectedWallet(wallet.id);
    setError(null);

    try {
      StellarWalletsKit.setWallet(wallet.id);
      const { address } = await StellarWalletsKit.selectedModule.getAddress();
      setPublicKey(address);
      setWalletName(wallet.name);
      setModalOpen(false);
    } catch (err) {
      let errMsg = err?.message || String(err);
      if (errMsg.toLowerCase().includes('not connected') || errMsg.toLowerCase().includes('not installed')) {
        setError('WALLET_NOT_FOUND');
      } else {
        console.error('Wallet connection error:', err);
        setError(errMsg);
      }
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch(e) {}
    setPublicKey(null);
    setWalletName(null);
  }, []);

  const signTransaction = useCallback(async (xdr, opts) => {
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr);
    return signedTxXdr;
  }, []);

  return {
    publicKey,
    walletName,
    connecting,
    error,
    isConnected: !!publicKey,
    modalOpen,
    selectedWallet,
    openModal,
    closeModal,
    connectWallet,
    disconnect,
    signTransaction,
  };
};
