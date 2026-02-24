import { generateWalletFromBiometric } from '../index';
import { ethers } from 'ethers';

// Mock argon2-browser as it might not work in Node environment easily
jest.mock('argon2-browser', () => ({
  hash: jest.fn().mockImplementation(({ pass, salt }) => {
    // Return a deterministic hash for testing
    const hashHex = Buffer.from(pass + salt).toString('hex').padEnd(64, '0').substring(0, 64);
    return Promise.resolve({ hashHex });
  }),
}));

describe('Wallet Generation', () => {
  it('should generate the same wallet address for the same biometric data and salt', async () => {
    const biometricData = 'my-fingerprint-data';
    const salt = 'device-id-123';

    const wallet1 = await generateWalletFromBiometric(biometricData, salt);
    const wallet2 = await generateWalletFromBiometric(biometricData, salt);

    expect(wallet1.address).toBe(wallet2.address);
    expect(wallet1.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should generate different wallet addresses for different biometric data', async () => {
    const salt = 'device-id-123';

    const wallet1 = await generateWalletFromBiometric('fingerprint-1', salt);
    const wallet2 = await generateWalletFromBiometric('fingerprint-2', salt);

    expect(wallet1.address).not.toBe(wallet2.address);
  });

  it('should generate different wallet addresses for different salts', async () => {
    const biometricData = 'my-fingerprint-data';

    const wallet1 = await generateWalletFromBiometric(biometricData, 'device-1');
    const wallet2 = await generateWalletFromBiometric(biometricData, 'device-2');

    expect(wallet1.address).not.toBe(wallet2.address);
  });
});
