// src/components/LocalTTSToggle.tsx
import React from 'react';
import { Box, Switch, FormControl, FormLabel, Tooltip, Flex, Badge, Icon } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

interface LocalTTSToggleProps {
  isLocalTTS: boolean;
  isLocalReady: boolean;
  isLoading: boolean;
  onChange: (useLocal: boolean) => void;
}

const LocalTTSToggle: React.FC<LocalTTSToggleProps> = ({
  isLocalTTS,
  isLocalReady,
  isLoading,
  onChange
}) => {
  return (
    <Box position="relative" zIndex={2}>
      <Tooltip 
        label={isLocalTTS 
          ? (isLocalReady 
            ? "Using browser-based TTS (no API calls for tts)" 
            : "Loading local TTS engine...")
          : "Using remote TTS API" 
        }
        placement="bottom"
      >
        <FormControl 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bg="gray.700"
          borderRadius="md"
          px={2}
          py={1}
        >
          <FormLabel htmlFor="local-tts-toggle" mb="0" fontSize="sm" color="gray.300" mr={2}>
            API
          </FormLabel>
          <Switch
            id="local-tts-toggle"
            isChecked={isLocalTTS}
            onChange={(e) => onChange(e.target.checked)}
            colorScheme="blue"
            size="sm"
            isDisabled={isLoading}
          />
          <FormLabel htmlFor="local-tts-toggle" mb="0" fontSize="sm" color="gray.300" ml={2}>
            Local
          </FormLabel>
          
          {isLocalTTS && !isLocalReady && (
            <Badge ml={1} colorScheme="yellow" fontSize="xs">
              Loading
            </Badge>
          )}
          
          <Tooltip label="Local TTS runs entirely in your browser without sending data to external servers. API mode uses our cloud service for higher quality audio.">
            <Flex alignItems="center" ml={1}>
              <Icon as={InfoIcon} color="gray.400" boxSize={3} />
            </Flex>
          </Tooltip>
        </FormControl>
      </Tooltip>
    </Box>
  );
};

export default LocalTTSToggle;