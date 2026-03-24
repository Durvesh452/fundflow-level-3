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
  const [kit, setKit] = useState(null);

  useEffect(() => {
    const walletsKit = new StellarWalletsKit({
      network: Networks.TESTNET,
      selectedWalletId: 'freighter',
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new xBullModule(),
      ],
    });
    setKit(walletsKit);
    // Expose sign transaction to global scope for DonateForm
    window.__fundflow_sign = async (xdr, opts) => {
      const { signedXDR } = await walletsKit.sign({
        xdr,
        publicKey: walletsKit.getPublicKey(),
      });
      return signedXDR;
    };
  }, []);

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (!connecting) setModalOpen(false);
  }, [connecting]);

  const connectWallet = useCallback(async (wallet) => {
    if (!kit) return;
    setConnecting(true);
    setSelectedWallet(wallet.id);
    setError(null);

    try {
      kit.setWallet(wallet.id);
      await kit.connect();
      const address = await kit.getPublicKey();
      setPublicKey(address);
      setWalletName(wallet.name);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to connect: ' + (err?.message || err));
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  }, [kit]);

  const disconnect = useCallback(async () => {
    if (kit) await kit.disconnect();
    setPublicKey(null);
    setWalletName(null);
  }, [kit]);

  const signTransaction = useCallback(async (xdr, opts) => {
    if (!kit) throw new Error('Wallet not connected');
    const { signedXDR } = await kit.sign({ xdr });
    return signedXDR;
  }, [kit]);

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
