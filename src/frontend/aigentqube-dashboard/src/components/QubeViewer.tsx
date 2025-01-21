import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
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
import { blockchainService } from '../services/BlockchainService';

interface QubeData {
  id: string;
  name: string;
  owner: string;
  createdAt: number;
  qubeType: 'MetaQube' | 'BlakQube' | 'TokenQube';
  metadata: Record<string, any>;
}

interface QubeViewerProps {
  address: string;
}

const QubeViewer: React.FC<QubeViewerProps> = ({ address }) => {
  const [qubes, setQubes] = useState<QubeData[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchQubes = async () => {
      try {
        const fetchedQubes = await blockchainService.getQubesByOwner(address);
        setQubes(fetchedQubes);
        setError('');
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching Qubes:', err);
        setError('Qube Retrieval Failed');
        setQubes([]);
        setIsLoading(false);
        toast({
          title: "Qube Retrieval Failed",
          description: err instanceof Error ? err.message : 'Unknown error',
          status: "error",
          duration: 5000,
          isClosable: true
        });
      }
    };

    if (address) {
      fetchQubes();
    }
  }, [address, toast]);

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

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Heading size="md">Your Qubes</Heading>
      {qubes.length === 0 ? (
        <Text>No Qubes found</Text>
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
