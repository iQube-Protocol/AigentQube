import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Box, 
  Button, 
  FormControl as ChakraFormControl, 
  FormLabel as ChakraFormLabel, 
  Input, 
  VStack as ChakraVStack, 
  Heading, 
  Text, 
  Textarea,
  Select as ChakraSelect,
  useToast as chakraUseToast
} from '@chakra-ui/react';

interface ContextDomain {
  name: string;
  description: string;
  keywords: string[];
  confidence_score: number;
}

interface ContextManagerProps {
  onContextUpdate: (context: ContextDomain) => void;
}

export const ContextManager: React.FC<ContextManagerProps> = ({ onContextUpdate }) => {
  const [domains, setDomains] = useState<{[key: string]: ContextDomain}>({});
  const [newDomain, setNewDomain] = useState<ContextDomain>({
    name: '',
    description: '',
    keywords: [],
    confidence_score: 0.5
  });
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket | null>(null);
  const toast = chakraUseToast();

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws/context');
    
    ws.onopen = () => {
      toast({
        title: "WebSocket Connected",
        description: "Real-time context updates enabled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setWebsocketConnection(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'context_update') {
          toast({
            title: "Context Updated",
            description: "Received new context from server",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
          onContextUpdate(data.context);
        }
      } catch (error) {
        toast({
          title: "WebSocket Message Error",
          description: String(error),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    ws.onerror = (error) => {
      toast({
        title: "WebSocket Error",
        description: String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    };

    return () => {
      ws.close();
    };
  }, [onContextUpdate, toast]);

  const handleAddDomain = () => {
    if (!newDomain.name) {
      toast({
        title: "Error",
        description: "Domain name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedDomains = {
      ...domains,
      [newDomain.name]: newDomain
    };

    // Send update via WebSocket if connection is open
    if (websocketConnection && websocketConnection.readyState === WebSocket.OPEN) {
      websocketConnection.send(JSON.stringify({
        domains: updatedDomains
      }));
    }

    // Update local state
    setDomains(updatedDomains);
    
    // Reset form
    setNewDomain({
      name: '',
      description: '',
      keywords: [],
      confidence_score: 0.5
    });

    toast({
      title: "Domain Added",
      description: `Domain ${newDomain.name} added to context`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px">
      <Heading mb={4}>iQube Context Manager</Heading>
      
      <ChakraVStack spacing={4} alignItems="stretch">
        {/* Domain Input Section */}
        <ChakraFormControl>
          <ChakraFormLabel>Domain Name</ChakraFormLabel>
          <Input 
            placeholder="Enter domain name (e.g., academic_research)"
            value={newDomain.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewDomain({...newDomain, name: e.target.value})}
          />
        </ChakraFormControl>

        <ChakraFormControl>
          <ChakraFormLabel>Domain Description</ChakraFormLabel>
          <Textarea 
            placeholder="Describe the domain"
            value={newDomain.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewDomain({...newDomain, description: e.target.value})}
          />
        </ChakraFormControl>

        <ChakraFormControl>
          <ChakraFormLabel>Keywords (comma-separated)</ChakraFormLabel>
          <Input 
            placeholder="Enter keywords"
            value={newDomain.keywords.join(', ')}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewDomain({
              ...newDomain, 
              keywords: e.target.value.split(',').map((k: string) => k.trim())
            })}
          />
        </ChakraFormControl>

        <ChakraFormControl>
          <ChakraFormLabel>Confidence Score</ChakraFormLabel>
          <ChakraSelect 
            value={newDomain.confidence_score}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewDomain({
              ...newDomain, 
              confidence_score: parseFloat(e.target.value)
            })}
          >
            {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(score => (
              <option key={score} value={score}>{score}</option>
            ))}
          </ChakraSelect>
        </ChakraFormControl>

        <Button 
          colorScheme="blue" 
          onClick={handleAddDomain}
        >
          Add Domain to Context
        </Button>

        {/* Current Domains Display */}
        <Box mt={4}>
          <Heading size="md" mb={2}>Current Domains</Heading>
          {Object.entries(domains).map(([name, domain]) => (
            <Box key={name} p={2} borderWidth="1px" mb={2}>
              <Text><strong>Name:</strong> {name}</Text>
              <Text><strong>Description:</strong> {domain.description}</Text>
              <Text><strong>Keywords:</strong> {domain.keywords.join(', ')}</Text>
              <Text><strong>Confidence:</strong> {domain.confidence_score}</Text>
            </Box>
          ))}
        </Box>
      </ChakraVStack>
    </Box>
  );
};

export default ContextManager;