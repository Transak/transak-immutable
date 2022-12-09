import ImmutableLib from '../src/index';
import { describe, expect, test } from '@jest/globals';
import * as dotenv from 'dotenv';

dotenv.config();

// variables
const mainTimeout = 14000;

// testData
const testData = {
  publicKey: process.env.MY_PUBLIC_KEY || '',
  privateKey: process.env.MY_PRIVATE_KEY || ' ',
  toWalletAddress: process.env.TOWALLETADDRESS || '',
  network: process.env.NETWORK || '',
  starkPrivateKey: process.env.STARK_PRIVATE_KEY || '',
  providerApiKey: process.env.ALCHEMY_API_KEY || '',
  amount: 0.1,
  decimals: 18,
  //0xb3dfd3dfb829b394f2467f4396f39ece7818d876 FCT , 0x1facdd0165489f373255a90304650e15481b2c85 IMX
  tokenAddress: '0xb3dfd3dfb829b394f2467f4396f39ece7818d876',
};

const keys = {
  sendTransactionResponse: [
    'amount',
    'date',
    'from',
    'gasCostCryptoCurrency',
    'network',
    'nonce',
    'to',
    'transactionHash',
    'transactionLink',
  ],
  getTransactionResponse: [
    'date',
    'gasCostCryptoCurrency',
    'gasCostInCrypto',
    'gasLimit',
    'isPending',
    'isExecuted',
    'isSuccessful',
    'isFailed',
    'isInvalid',
    'network',
    'nonce',
    'transactionHash',
    'transactionLink',
  ],
};

const runtime = { transactionHash: '' };

describe('Immutable module', () => {
  test(
    'should getBalance',
    async function () {
      const { network, decimals, tokenAddress, publicKey } = testData;
      const result = await ImmutableLib.getBalance(network, decimals, publicKey, tokenAddress);

      console.log({ result });
      expect(typeof result).toBe('number');
    },
    mainTimeout,
  );

  test(
    'should isValidWalletAddress',
    async function () {
      const result = await ImmutableLib.isValidWalletAddress(testData.toWalletAddress);

      console.log({ result });
      expect(result).toBe(true);
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction ERC20',
    async function () {
      const {
        toWalletAddress: to,
        network,
        amount,
        decimals,
        privateKey,
        tokenAddress,
        starkPrivateKey,
        providerApiKey,
      } = testData;
      const result = await ImmutableLib.sendTransaction({
        to,
        amount,
        network,
        decimals,
        privateKey,
        tokenAddress,
        starkPrivateKey,
        providerApiKey,
      });

      runtime.transactionHash = result.receipt.transactionHash;

      console.log({ result });
      expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.sendTransactionResponse));
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction ETH',
    async function () {
      const {
        toWalletAddress: to,
        network,
        amount,
        decimals,
        privateKey,
        tokenAddress,
        starkPrivateKey,
        providerApiKey,
      } = testData;

      const result = await ImmutableLib.sendTransaction({
        to,
        amount,
        network,
        decimals,
        privateKey,
        starkPrivateKey,
        providerApiKey,
      });

      runtime.transactionHash = result.receipt.transactionHash;

      console.log({ result });
      expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.sendTransactionResponse));
    },
    mainTimeout * 3,
  );

  test(
    'should getTransaction',
    async function () {
      const { network, privateKey } = testData;
      const { transactionHash: txnId } = runtime;
      const result = await ImmutableLib.getTransaction(txnId, network);

      console.log({ result });
      if (result) expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.getTransactionResponse));
    },
    mainTimeout * 10,
  );

  test(
    'should check isImmutableAccountExists',
    async function () {
      const result = await ImmutableLib.isImmutableAccountExists(
        '0x7EE860cDCc157998EaEF68f6B5387DE77fe3D02F',
        'testnet',
      );

      console.log({ result });
      expect(result).toEqual(true);
    },
    mainTimeout * 10,
  );
});
