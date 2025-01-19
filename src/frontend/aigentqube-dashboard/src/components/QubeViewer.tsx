import React, { useState, useEffect } from 'react';
import BlockchainService from '../services/BlockchainService';
import { 
  Box, 
  VStack, 
  Text, 
  Heading, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  TableContainer,
  Badge,
  Spinner,
  useToast
} from '@chakra-ui/react';

interface QubeData {
  id: string;
  name: string;
  owner: string;
  createdAt: number;
  qubeType: 'MetaQube' | 'BlakQube' | 'TokenQube';
  metadata: Record<string, any>;
}

const QubeViewer: React.FC = () => {
  const [qubes, setQubes] = useState<QubeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchQubes = async () => {
      try {
        // First, connect wallet
        const connectedAccount = await BlockchainService.connectWallet();
        
        if (connectedAccount) {
          setAccount(connectedAccount);
          
          // Fetch Qubes for the connected account
          const fetchedQubes = await BlockchainService.getQubesByOwner(connectedAccount);
          setQubes(fetchedQubes);
          setIsLoading(false);
        } else {
          throw new Error('Wallet connection failed');
        }
      } catch (error) {
        console.error('Error fetching Qubes:', error);
        toast({
          title: "Qube Retrieval Failed",
          description: error instanceof Error ? error.message : 'Unknown error',
          status: "error",
          duration: 5000,
          isClosable: true
        });
        setIsLoading(false);
      }
    };

    fetchQubes();
  }, []);

  const renderQubeTypeBadge = (type: QubeData['qubeType']) => {
    const badgeColors = {
      'MetaQube': 'blue',
      'BlakQube': 'purple',
      'TokenQube': 'green'
    };

    return (
      <Badge colorScheme={badgeColors[type]}>
        {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Heading size="md" mb={4}>
        {account ? `Qubes for ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Qube Registry'}
      </Heading>

      {qubes.length === 0 ? (
        <Box textAlign="center" p={4} bg="gray.100" borderRadius="md">
          <Text>No Qubes registered yet</Text>
        </Box>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Created At</Th>
                <Th>Metadata</Th>
              </Tr>
            </Thead>
            <Tbody>
              {qubes.map((qube) => (
                <Tr key={qube.id}>
                  <Td>{qube.id}</Td>
                  <Td>{qube.name}</Td>
                  <Td>{renderQubeTypeBadge(qube.qubeType)}</Td>
                  <Td>{new Date(qube.createdAt * 1000).toLocaleDateString()}</Td>
                  <Td>
                    <Text 
                      maxWidth="200px" 
                      overflow="hidden" 
                      textOverflow="ellipsis"
                    >
                      {JSON.stringify(qube.metadata)}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </VStack>
  );
};

export default QubeViewer;
