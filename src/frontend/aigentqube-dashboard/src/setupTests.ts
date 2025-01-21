// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock global objects
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
    on: jest.fn(),
    removeListener: jest.fn()
  },
  writable: true
});

// Mock Web3Provider
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  providers: {
    Web3Provider: jest.fn().mockImplementation(() => ({
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
        signMessage: jest.fn()
      })
    }))
  },
  utils: {
    formatBytes32String: jest.fn().mockReturnValue('0x1234')
  }
}));
