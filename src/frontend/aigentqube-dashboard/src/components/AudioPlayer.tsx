// src/components/SimpleAudioPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Tooltip, Spinner, Flex, Text } from '@chakra-ui/react';
import { Play, Pause, Volume2 } from 'lucide-react';
import AudioWaveform from './AudioWaveform';

interface SimpleAudioPlayerProps {
  audioUrl: string;
  isLoading?: boolean;
}

const SimpleAudioPlayer: React.FC<SimpleAudioPlayerProps> = ({ 
  audioUrl,
  isLoading = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

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
        setDuration(audio.duration);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        cancelAnimationFrame(animationRef.current as number);
      });
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        cancelAnimationFrame(animationRef.current as number);
      });
      
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(updateProgress);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
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
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('error', () => {});
        cancelAnimationFrame(animationRef.current as number);
      };
    }
  }, [audioUrl]);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

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

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box
      mt={2}
      borderTop="1px solid"
      borderColor="whiteAlpha.300"
      pt={2}
      width="100%"
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          {isLoading ? (
            <Spinner size="sm" color="blue.400" thickness="2px" speed="0.8s" mr={2} />
          ) : !isReady ? (
            <IconButton
              aria-label="Audio not available"
              icon={<Volume2 size={16} />}
              isDisabled={true}
              size="sm"
              colorScheme="gray"
              variant="ghost"
              opacity={0.5}
            />
          ) : (
            <IconButton
              aria-label={isPlaying ? "Pause" : "Play"}
              icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
              onClick={togglePlayback}
              size="sm"
              colorScheme="blue"
              bg={isPlaying ? "blue.500" : "blue.400"}
              color="white"
              _hover={{
                bg: isPlaying ? "blue.600" : "blue.500"
              }}
              mr={2}
            />
          )}
          
          {isReady && (
            <Text fontSize="xs" color="gray.300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          )}
        </Flex>
        
        <Box width="60%" maxWidth="200px">
          <AudioWaveform
            isActive={isPlaying} 
            color={isPlaying ? "blue.400" : "gray.400"} 
            height={16}
            width="100%"
            barCount={7}
            progress={duration > 0 ? currentTime / duration : 0}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default SimpleAudioPlayer;