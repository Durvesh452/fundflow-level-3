// Mock Wallet Provider to bypass breaking @creit.tech/stellar-wallets-kit
export const Networks = {
  TESTNET: 'Test SDF Network ; September 2015',
  PUBLIC: 'Public Global Stellar Network ; September 2015',
};

export class StellarWalletsKit {
  static init() {
    console.log('Mock SWK Initialized');
  }

  static async authModal() {
    // Check if Freighter is available
    if (window.stellar?.isFreighter) {
      try {
        const { address } = await window.stellar.getAddress();
        return { address };
      } catch (e) {
        throw new Error('Freighter rejected connection');
      }
    }
    
    // Fallback/Prompt for a dev address if no wallet
    const mockAddr = 'GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MTFBJXQM';
    console.log('No wallet found, using mock address:', mockAddr);
    return { address: mockAddr };
  }

  static async disconnect() {
    console.log('Mock SWK Disconnected');
  }

  static async signTransaction(xdr) {
    if (window.stellar?.isFreighter) {
      const { signedTxXdr } = await window.stellar.signTransaction(xdr);
      return signedTxXdr;
    }
    throw new Error('Please install Freighter to sign transactions.');
  }
}

export class FreighterModule {}
export class AlbedoModule {}
export class XBullModule {}
