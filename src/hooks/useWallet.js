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

  const signTransaction = useCallback(async (xdr, opts) => {
    if (window.__mockKeypair) {
      const { TransactionBuilder } = await import('@stellar/stellar-sdk');
      const tx = TransactionBuilder.fromXDR(xdr, CONFIG.NETWORK_PASSPHRASE);
      tx.sign(window.__mockKeypair);
      return tx.toXDR();
    }
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr);
    return signedTxXdr;
  }, []);

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
    } catch (e) {}
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
