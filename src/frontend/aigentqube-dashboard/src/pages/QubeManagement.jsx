import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  VStack,
  Heading
} from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import QubeRegistration from '../components/QubeRegistration';
import QubeViewer from '../components/QubeViewer';

const QubeManagement = () => {
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try {
      // Check if Ethereum provider (like MetaMask) is available
      if (window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create a Web3Provider instance
        const provider = new Web3Provider(window.ethereum);
        const walletSigner = provider.getSigner();
        
        setSigner(walletSigner);
      } else {
        alert('Please install MetaMask to use this feature');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet');
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" p={6}>
      <VStack spacing={6}>
        <Heading>iQube Management</Heading>
        
        {!signer ? (
          <Box 
            width="100%" 
            p={4} 
            textAlign="center" 
            borderWidth="1px" 
            borderRadius="lg"
            onClick={connectWallet}
            cursor="pointer"
            _hover={{ bg: "gray.100" }}
          >
            Connect Wallet to Manage Qubes
          </Box>
        ) : (
          <Tabs width="100%" isFitted>
            <TabList>
              <Tab>Register Qube</Tab>
              <Tab>View Qube</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <QubeRegistration signer={signer} />
              </TabPanel>
              <TabPanel>
                <QubeViewer signer={signer} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Box>
  );
};

export default QubeManagement;
