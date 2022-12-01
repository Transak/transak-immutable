import { BigNumber, utils } from 'ethers';

// converts any units to decimal
export const _toDecimal = (amount: string, decimals: number): string => {
  // sting to BigNumber
  return utils.formatUnits(BigNumber.from(amount), decimals);
};

// converts Crypto to lowest denomination
export const _toCrypto = (amount: string, decimals: number): string => utils.parseUnits(amount, decimals).toString();

// get public key from private key
export const _getPublicKey = (privateKey: string): string => {
  return utils.computeAddress('0x' + privateKey);
};
