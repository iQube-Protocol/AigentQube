import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import App from './app'; 

// Create a new axios mock adapter
const mock = new MockAdapter(axios);

describe('AigentQube Dashboard', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mock.reset();
    
    // Mock Web3 and Ethereum
    (window as any).ethereum = {
      request: jest.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      on: jest.fn(),
      removeListener: jest.fn()
    };
  });

  test('renders dashboard title', () => {
    render(<App />);
    const titleElement = screen.getByText(/AigentQube Dashboard/i);
    expect(titleElement).toBeInTheDocument();
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
    const agentInteractionButton = screen.getByText(/Interact with Agent/i);
    
    fireEvent.click(agentInteractionButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Agent: test_agent_123/i)).toBeInTheDocument();
      expect(screen.getByText(/Test AI response/i)).toBeInTheDocument();
    });
  });
});
