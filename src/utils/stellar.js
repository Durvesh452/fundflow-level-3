import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  Address,
  rpc,
} from '@stellar/stellar-sdk';
import { CONFIG } from '../config';

const server = new rpc.Server(CONFIG.RPC_URL, { allowHttp: false });

/**
 * Format stroops (int128) to a human-readable XLM amount (string)
 */
export const fromStroops = (stroops) => {
  if (!stroops && stroops !== 0n && stroops !== 0) return '0.00';
  const val = typeof stroops === 'bigint' ? stroops : BigInt(stroops);
  const xlm = Number(val) / 10_000_000;
  return xlm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Format XLM human amount to stroops (BigInt)
 */
export const toStroops = (xlm) => {
  const n = parseFloat(xlm);
  if (isNaN(n) || n <= 0) return null;
  return BigInt(Math.round(n * 10_000_000));
};

/**
 * Build a Soroban contract client helper
 */
export const getContract = () => new Contract(CONFIG.CONTRACT_ID);

/**
 * Fetch campaign info from the contract (read-only simulation)
 */
export const fetchCampaignInfo = async () => {
  const MOCK_DATA = {
    total_raised: 0n,
    donor_count: 0,
    last_donation_amount: 0n,
    last_donor_address: null,
    goal: BigInt(CONFIG.FUNDING_GOAL_XLM * 10_000_000),
  };

  // Return mock data when contract is not deployed
  if (!CONFIG.CONTRACT_ID || CONFIG.CONTRACT_ID === 'YOUR_CONTRACT_ID_HERE') {
    return MOCK_DATA;
  }

  try {
    const contract = getContract();
    let dummyAccount;
    try {
      dummyAccount = await server.getAccount(
        'GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MTFBJXQM'
      );
    } catch {
      dummyAccount = {
        accountId: () => 'GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MTFBJXQM',
        sequence: '0',
        sequenceNumber() { return this.sequence; },
        incrementSequenceNumber() { this.sequence = String(BigInt(this.sequence) + 1n); },
      };
    }

    const tx = new TransactionBuilder(dummyAccount, {
      fee: BASE_FEE,
      networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_campaign_info'))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      console.warn('Contract simulation error:', sim.error);
      return MOCK_DATA;
    }

    const result = scValToNative(sim.result.retval);
    return {
      total_raised: BigInt(result.total_raised ?? 0),
      donor_count: Number(result.donor_count ?? 0),
      last_donation_amount: BigInt(result.last_donation_amount ?? 0),
      last_donor_address: result.last_donor_address ?? null,
      goal: BigInt(result.goal ?? CONFIG.FUNDING_GOAL_XLM * 10_000_000),
    };
  } catch (err) {
    console.warn('fetchCampaignInfo: using mock data due to error:', err.message);
    return MOCK_DATA;
  }
};

/**
 * Submit a donate transaction
 * @param {string} donorPublicKey
 * @param {string} amountXlm - human readable XLM string
 * @param {function} signTransaction - from the wallet kit
 * @returns {string} transaction hash
 */
export const submitDonation = async (donorPublicKey, amountXlm, signTransaction) => {
  const amountStroops = toStroops(amountXlm);
  if (!amountStroops || amountStroops <= 0n) {
    throw new Error('Invalid donation amount');
  }

  if (CONFIG.CONTRACT_ID === 'YOUR_CONTRACT_ID_HERE') {
    throw new Error('CONTRACT_NOT_DEPLOYED');
  }

  const contract = getContract();
  const account = await server.getAccount(donorPublicKey);

  const tx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'donate',
        new Address(donorPublicKey).toScVal(),
        nativeToScVal(amountStroops, { type: 'i128' })
      )
    )
    .setTimeout(30)
    .build();

  // Simulate first to check for errors and get footprint
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  // Assemble prepared transaction
  const preparedTx = rpc.assembleTransaction(tx, sim).build();
  const preparedXdr = preparedTx.toXDR();

  // Sign with wallet
  let signedXdr;
  try {
    const result = await signTransaction(preparedXdr, {
      network: CONFIG.NETWORK,
      networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
    });
    signedXdr = typeof result === 'string' ? result : result.signedTxXdr;
  } catch (err) {
    if (
      err?.message?.toLowerCase().includes('declined') ||
      err?.message?.toLowerCase().includes('reject') ||
      err?.message?.toLowerCase().includes('cancel') ||
      err?.code === 4001
    ) {
      throw new Error('USER_REJECTED');
    }
    throw err;
  }

  // Submit
  const { TransactionBuilder: TB } = await import('@stellar/stellar-sdk');
  const signedTx = TB.fromXDR(signedXdr, CONFIG.NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(signedTx);

  if (sendResult.status === 'ERROR') {
    throw new Error(`INSUFFICIENT_BALANCE: ${sendResult.errorResult?.toString()}`);
  }

  // Poll for confirmation
  const hash = sendResult.hash;
  let getResult;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    getResult = await server.getTransaction(hash);
    if (getResult.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) break;
  }

  if (getResult.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`TRANSACTION_FAILED: ${getResult.resultXdr}`);
  }

  return hash;
};
