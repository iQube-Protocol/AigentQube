import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ethers } from 'ethers';
import QubeRegistrationPanel from '../QubeRegistrationPanel';
import { registerQube } from '../../utils/contractInteraction';

// Mock the registerQube function
jest.mock('../../utils/contractInteraction', () => ({
  registerQube: jest.fn()
}));

// Mock Signer
const mockSigner = {
  getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  signMessage: jest.fn(),
  provider: {} as any
} as unknown as ethers.Signer;

describe('QubeRegistrationPanel', () => {
  const renderComponent = () => {
    return render(
      <ChakraProvider>
        <QubeRegistrationPanel 
          signer={mockSigner}
          onRegistrationComplete={jest.fn()}
        />
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with default DataQube tab', () => {
    renderComponent();
    
    expect(screen.getByText('DataQube')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Qube Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your Qube')).toBeInTheDocument();
  });

  test('allows switching between Qube types', () => {
    renderComponent();
    
    const contentQubeTab = screen.getByText('ContentQube');
    fireEvent.click(contentQubeTab);
    
    // Check for content type select 
    const contentTypeSelect = screen.getByLabelText(/Qube Type/i);
    expect(contentTypeSelect).toBeInTheDocument();
  });

  test('validates required metaQube fields', async () => {
    renderComponent();
    
    const registerButton = screen.getByText(/Register DataQube/i);
    fireEvent.click(registerButton);
    
    // Check for validation error toasts
    await waitFor(() => {
      expect(screen.getByText('Validation Error')).toBeInTheDocument();
    });
  });

  test('successfully registers a DataQube', async () => {
    // Mock successful registration
    (registerQube as jest.Mock).mockResolvedValue({
      transactionHash: '0x1234',
      status: 1
    });

    renderComponent();
    
    // Fill out required fields
    fireEvent.change(screen.getByPlaceholderText('Enter Qube Name'), {
      target: { value: 'HelloWorld Qube #001' }
    });
    fireEvent.change(screen.getByPlaceholderText('Describe your Qube'), {
      target: { value: 'A test DataQube for HelloWorld' }
    });

    // Fill out metaQube fields
    fireEvent.change(screen.getByLabelText('iQube Creator'), {
      target: { value: 'Aigent Z' }
    });

    // Add a data point
    const addDataPointButton = screen.getByText('Add Data Point');
    fireEvent.click(addDataPointButton);

    const dataPointNameInputs = screen.getAllByPlaceholderText('Data Point Name');
    const dataPointValueInputs = screen.getAllByPlaceholderText('Data Point Value');
    
    fireEvent.change(dataPointNameInputs[0], { 
      target: { value: 'Test Data Point' } 
    });
    fireEvent.change(dataPointValueInputs[0], { 
      target: { value: 'Test Value' } 
    });

    // Fill out BlackQube specific details
    fireEvent.change(screen.getByPlaceholderText('Enter Profession'), {
      target: { value: 'Tech Consultant' }
    });

    const web3InterestsSelect = screen.getByLabelText('Web3 Interests');
    fireEvent.change(web3InterestsSelect, {
      target: { 
        selectedOptions: [
          { value: 'Trading' },
          { value: 'Investing' },
          { value: 'Learning' }
        ]
      }
    });

    fireEvent.change(screen.getByPlaceholderText('Enter Wallet Address'), {
      target: { value: '0x17E1B6c2BfBC721c1dc03d488746E0C6F7ef5242' }
    });

    // Register
    const registerButton = screen.getByText(/Register DataQube/i);
    fireEvent.click(registerButton);

    // Wait for registration
    await waitFor(() => {
      expect(registerQube).toHaveBeenCalledWith(
        expect.stringContaining('DataQube'),
        expect.any(String),
        expect.any(String),
        mockSigner,
        expect.objectContaining({
          iQubeName: 'HelloWorld Qube #001',
          iQubeCreator: 'Aigent Z',
          iQubeType: 'DataQube',
          ownerType: 'Person',
          ownerIdentifiability: 'Semi-Anon',
          sensitivityScore: 3,
          verifiabilityScore: 6,
          accuracyScore: 7,
          riskScore: 2
        })
      );
    });
  });

  test('handles ContentQube registration', async () => {
    (registerQube as jest.Mock).mockResolvedValue({
      transactionHash: '0x5678',
      status: 1
    });

    renderComponent();
    
    // Switch to ContentQube
    const contentQubeTab = screen.getByText('ContentQube');
    fireEvent.click(contentQubeTab);

    // Fill out required fields
    fireEvent.change(screen.getByPlaceholderText('Enter Qube Name'), {
      target: { value: 'Test ContentQube' }
    });
    fireEvent.change(screen.getByPlaceholderText('Describe your Qube'), {
      target: { value: 'A test ContentQube for unit testing' }
    });

    // Fill out metaQube fields
    fireEvent.change(screen.getByLabelText('iQube Creator'), {
      target: { value: 'Test Content Creator' }
    });

    // Select qube type
    const contentTypeSelect = screen.getByLabelText(/Qube Type/i);
    fireEvent.change(contentTypeSelect, { target: { value: 'text' } });

    // Register
    const registerButton = screen.getByText(/Register ContentQube/i);
    fireEvent.click(registerButton);

    // Wait for registration
    await waitFor(() => {
      expect(registerQube).toHaveBeenCalledWith(
        expect.stringContaining('ContentQube'),
        expect.any(String),
        expect.any(String),
        mockSigner,
        expect.objectContaining({
          iQubeName: 'Test ContentQube',
          iQubeCreator: 'Test Content Creator',
          iQubeType: 'ContentQube',
          ownerType: 'Person'
        })
      );
    });
  });

  test('handles registration errors', async () => {
    // Mock registration error
    (registerQube as jest.Mock).mockRejectedValue(new Error('Registration Failed'));

    renderComponent();
    
    // Fill out required fields
    fireEvent.change(screen.getByPlaceholderText('Enter Qube Name'), {
      target: { value: 'Error Test DataQube' }
    });
    fireEvent.change(screen.getByPlaceholderText('Describe your Qube'), {
      target: { value: 'A DataQube to test error handling' }
    });

    // Fill out metaQube fields
    fireEvent.change(screen.getByLabelText('iQube Creator'), {
      target: { value: 'Error Test Creator' }
    });

    // Add a data point to pass validation
    const addDataPointButton = screen.getByText('Add Data Point');
    fireEvent.click(addDataPointButton);

    const dataPointNameInputs = screen.getAllByPlaceholderText('Data Point Name');
    const dataPointValueInputs = screen.getAllByPlaceholderText('Data Point Value');
    
    fireEvent.change(dataPointNameInputs[0], { 
      target: { value: 'Test Data Point' } 
    });
    fireEvent.change(dataPointValueInputs[0], { 
      target: { value: 'Test Value' } 
    });

    // Register
    const registerButton = screen.getByText(/Register DataQube/i);
    fireEvent.click(registerButton);

    // Wait for error handling
    await waitFor(() => {
      const errorToasts = screen.queryAllByText(/Registration Failed/i);
      expect(errorToasts.length).toBeGreaterThan(0);
    });
  });
});
