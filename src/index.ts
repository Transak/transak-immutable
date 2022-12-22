import { utils } from 'ethers';
import { ImmutableX, Config } from '@imtbl/core-sdk';
import { AlchemyProvider, getDefaultProvider } from '@ethersproject/providers';
import { networks } from './config';
import { _toDecimal, _toCrypto, _getPublicKey } from './utils/utils';
import { generateWalletConnection } from './utils/walletConnection';
import { Network, GetTransactionResult, SendTransactionParams, SendTransactionResult } from './types';

/**
 * Get the network config
 * @param network
 * @returns
 */
const getNetwork = (network: string) => (network === 'main' ? networks[network] : networks.testnet) as Network;

/**
 * Validate the wallet address
 * @param address
 * @returns
 */
const isValidWalletAddress = (address: string) => utils.isAddress(address) as boolean;

/**
 *
 * @param address
 * @param network
 * @returns
 */
const isImmutableAccountExists = async (address: string, network: string) => {
  const client = await getClient(network);

  try {
    const userData = await client.getUser(address);
    if (userData) return true;
  } catch (error) {
    // if the user is not found, the getUser will throw an error
    return false;
  }

  return false;
};

/**
 *
 * @param txId
 * @param network
 * @returns
 */
const getTransactionLink = (txId: string, network: string) => getNetwork(network).transactionLink(txId) as string;

/**
 * get wallet link for the given address
 * @param walletAddress
 * @param network
 * @returns
 */
const getWalletLink = (walletAddress: string, network: string) =>
  getNetwork(network).walletLink(walletAddress) as string;

/**
 * create a client instance
 * @param network
 * @returns
 */
async function getClient(network: string): Promise<any> {
  const networkName: string = getNetwork(network).networkName;

  const config = networkName === 'PRODUCTION' ? Config.PRODUCTION : Config.SANDBOX;

  const client = new ImmutableX(config);

  return client;
}

// connect provider to the network
const getProvider = (providerApiKey: string, network: string) => {
  const alchemyNetwork: string = getNetwork(network).alchemyNetwork;
  if (providerApiKey) {
    return new AlchemyProvider(alchemyNetwork, providerApiKey);
  }

  // if alchemyKey is not provided, use the default provider
  return getDefaultProvider(alchemyNetwork);
};

/**
 * Get the balance of the transak wallet address
 * @param network
 * @param decimals
 * @param publicKey
 * @param tokenId // tokenId
 *
 * @returns
 */
async function getBalance(network: string, decimals: number, publicKey: string, tokenAddress: string): Promise<number> {
  const client = await getClient(network);

  // tokenAddress is empty string for ETH

  let balance: string = '0';

  if (tokenAddress) {
    const balanceResponse: any = await client.getBalance({
      owner: publicKey,
      address: tokenAddress,
    });

    balance = balanceResponse.balance;
  } else {
    // the above query will fail if the contactAddress is not found, in case of ETH there is not contract Address
    // so we need to query the listBalances and find the balance for the eth address

    const listBalances: any = await client.listBalances({
      owner: publicKey,
    });

    const eth = listBalances.result.find((item: any) => item.token_address === '');
    balance = eth ? eth.balance : '0';
  }

  return Number(_toDecimal(balance, decimals));
}

/**
 * Get the transaction details by transaction id
 * @param txnId
 * @param network
 * @param privateKey
 * @param accountId
 * @returns
 */
async function getTransaction(txnId: string, network: string): Promise<GetTransactionResult | null> {
  try {
    const client = await getClient(network);
    const transferResponse = await client.getTransfer({ id: txnId });

    return {
      transactionData: transferResponse,
      receipt: {
        date: transferResponse.timestamp || null,
        gasCostCryptoCurrency: '',
        gasCostInCrypto: 0,
        gasLimit: 0,
        isPending: false,
        isExecuted: true,
        isSuccessful: transferResponse.status === 'success',
        isFailed: transferResponse.status !== 'success',
        isInvalid: transferResponse.status !== 'success',
        network,
        nonce: 0,
        transactionHash: transferResponse.transaction_id,
        transactionLink: getTransactionLink(txnId, network),
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Send the transaction to the Hedera network
 * @param param0
 * @returns
 */
async function sendTransaction({
  to,
  amount,
  network,
  privateKey,
  decimals,
  tokenAddress,
  starkPrivateKey,
  providerApiKey,
}: SendTransactionParams): Promise<SendTransactionResult> {
  const client = await getClient(network);

  // amount in lowest denomination - tinybars in this case
  const amountInCrypto = _toCrypto(amount.toString(), decimals);

  const walletConnection = await generateWalletConnection(
    privateKey,
    starkPrivateKey,
    getProvider(providerApiKey,network),
  );

  // build the transfer options
  const transferOptions: any = {
    receiver: to,
    amount: amountInCrypto,
  };

  if (tokenAddress) {
    // if tokenAddress is not empty, then it is a ERC20 token transfer
    transferOptions.type = 'ERC20';
    transferOptions.tokenAddress = tokenAddress;
  } else {
    // if tokenAddress is empty - send ETH
    transferOptions.type = 'ETH';
  }

  // transfer
  const transferResponse = await client.transfer(walletConnection, transferOptions);

  return {
    transactionData: transferResponse,
    receipt: {
      amount,
      date: transferResponse.time || null,
      from: _getPublicKey(privateKey) || '',
      gasCostCryptoCurrency: '',
      network,
      nonce: 0,
      to,
      transactionHash: transferResponse.transfer_id,
      transactionLink: getTransactionLink(transferResponse.transfer_id, network),
    },
  };
}

export = {
  getTransactionLink,
  getWalletLink,
  getTransaction,
  isValidWalletAddress,
  sendTransaction,
  getBalance,
  isImmutableAccountExists,
};
