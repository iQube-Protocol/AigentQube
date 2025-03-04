// src/components/AudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Tooltip, Spinner, Flex, useTheme } from '@chakra-ui/react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  isLoading?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl,
  isLoading = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (audioUrl) {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('canplaythrough', () => {
        setIsReady(true);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });
      
      audio.addEventListener('play', () => {
        setIsPlaying(true);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsReady(false);
        setIsPlaying(false);
      });
      
      return () => {
        // Clean up event listeners
        audio.pause();
        audio.src = '';
        audio.removeEventListener('canplaythrough', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('pause', () => {});
        audio.removeEventListener('play', () => {});
        audio.removeEventListener('error', () => {});
      };
    }
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Stop any other playing audio elements
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause();
        }
      });
      
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  return (
    <Box 
      position="absolute"
      top="50%" 
      right="-20px"
      transform="translateY(-50%)"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isLoading ? (
        <Box
          bg="blue.500"
          borderRadius="full"
          width="36px"
          height="36px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="md"
        >
          <Spinner size="sm" color="white" thickness="2px" />
        </Box>
      ) : isReady && (
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          onClick={togglePlayback}
          size="sm"
          colorScheme="blue"
          bg={isPlaying ? "blue.600" : "blue.500"}
          color="white"
          _hover={{
            bg: isPlaying ? "blue.700" : "blue.600"
          }}
          borderRadius="full"
          boxShadow="md"
          width="36px"
          height="36px"
          opacity={isHovering || isPlaying ? 1 : 0.7}
          transition="all 0.2s ease-in-out"
        />
      )}
    </Box>
  );
};

export default AudioPlayer;