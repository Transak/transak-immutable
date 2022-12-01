import ImmutableLib from '../src/index';
import { describe, expect, test } from '@jest/globals';
import { AlchemyProvider } from '@ethersproject/providers';
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
  alchemyKey: process.env.ALCHEMY_API_KEY || '',
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
        alchemyKey,
      } = testData;
      // connect provider
      const provider = new AlchemyProvider('goerli', alchemyKey);

      const result = await ImmutableLib.sendTransaction({
        to,
        amount,
        network,
        decimals,
        privateKey,
        tokenAddress,
        starkPrivateKey,
        provider,
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
        alchemyKey,
      } = testData;
      // connect provider
      const provider = new AlchemyProvider('goerli', alchemyKey);

      const result = await ImmutableLib.sendTransaction({
        to,
        amount,
        network,
        decimals,
        privateKey,
        starkPrivateKey,
        provider,
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
});
