import { Network } from './types';

export const networks: Record<string, Network> = {
  main: {
    transactionLink: hash => `https://immutascan.io/tx/${hash}`,
    walletLink: address => `https://immutascan.io/address/${address}`,
    networkName: 'PRODUCTION',
    alchemyNetwork: 'homestead',
  },
  testnet: {
    // immutascan is not present in testnet , so using immutable sandbox api
    transactionLink: hash => `https://api.sandbox.x.immutable.com/v1/transfers/${hash}`,
    walletLink: address => `https://api.sandbox.x.immutable.com/v2/balances/${address}`,
    networkName: 'SANDBOX',
    alchemyNetwork: 'goerli',
  },
};

module.exports = { networks };
