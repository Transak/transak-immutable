import { Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { createStarkSigner, WalletConnection } from '@imtbl/core-sdk';

/**
 * Generate a ethSigner/starkSigner object from a private key.
 */
export const generateWalletConnection = async (
  privateKey: string,
  starkKey: string,
  provider: Provider,
): Promise<WalletConnection> => {
  // L1 credentials
  const ethSigner = new Wallet(privateKey).connect(provider);

  // L2 credentials
  const starkSigner = createStarkSigner(starkKey);

  return {
    ethSigner,
    starkSigner,
  };
};
