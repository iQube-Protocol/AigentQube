import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import App from './app';

// Mock Web3 and axios
jest.mock('web3', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    eth: {
      getAccounts: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890'])
    }
  }))
}));

const mock = new MockAdapter(axios);

describe('Aigent Z Dashboard', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mock.reset();
    
    // Mock Ethereum object
    (window as any).ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn()
    };
  });

  test('renders dashboard header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Aigent Z Staging Dashboard/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('wallet connection button works', async () => {
    render(<App />);
    const connectButton = screen.getByText(/Connect Wallet/i);
    
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/Connected: 0x1234.../i)).toBeInTheDocument();
    });
  });

  test('agent interaction works', async () => {
    // Mock API response for agent interaction
    mock.onPost('/api/agent/interact').reply(200, {
      response: 'Test AI response'
    });

    render(<App />);
    
    // Simulate agent interaction
    const interactButton = screen.getByText(/Interact with Agent/i);
    fireEvent.click(interactButton);

    await waitFor(() => {
      expect(screen.getByText(/Agent: test_agent_123/i)).toBeInTheDocument();
      expect(screen.getByText(/Test AI response/i)).toBeInTheDocument();
    });
  });
});
