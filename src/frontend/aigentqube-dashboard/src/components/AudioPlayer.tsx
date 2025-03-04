import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Spinner } from '@chakra-ui/react';
import { Play, Pause } from 'lucide-react';

interface AudioChunk {
  id: string;
  text: string;
  audioUrl: string | null;
  isLoading: boolean;
  error: string | null;
  index: number;
}

interface AudioPlayerProps {
  audioChunks?: AudioChunk[];
  isLoading?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioChunks = [], isLoading = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [waitingForNextChunk, setWaitingForNextChunk] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<{ buffer: AudioBuffer; index: number }[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
      audioContextRef.current = null;
      queueRef.current = [];
    };
  }, []);

  const fetchAndDecodeChunk = async (chunkUrl: string, index: number): Promise<void> => {
    if (!audioContextRef.current) return;

    try {
      console.log(`[AudioPlayer] Fetching chunk ${index}: ${chunkUrl}`);
      const response = await fetch(chunkUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      // Add chunk in order, ensuring no duplicates
      if (!queueRef.current.some((c) => c.index === index)) {
        queueRef.current.push({ buffer, index });
        queueRef.current.sort((a, b) => a.index - b.index);
      }

      console.log(`[AudioPlayer] Chunk ${index} decoded and added to queue`);

      // Show play button when first chunk is available
      if (!isReady) {
        setIsReady(true);
      }

      // If we were waiting for this chunk, resume playback
      if (waitingForNextChunk && index === currentChunkIndex + 1) {
        console.log(`[AudioPlayer] New chunk arrived. Resuming playback.`);
        setWaitingForNextChunk(false);
        playChunk(index);
      }

      // Auto-play if first chunk is loaded and playback hasn't started
      if (!isPlayingRef.current && queueRef.current.length === 1) {
        console.log(`[AudioPlayer] Auto-playing first chunk ${index}`);
        playChunk(index);
      }

    } catch (error) {
      console.error(`[AudioPlayer] Error decoding chunk ${index}:`, error);
    }
  };

  const playChunk = async (index: number) => {
    if (!audioContextRef.current) return;

    // Get the next available chunk
    const chunkToPlay = queueRef.current.find((c) => c.index === index);
    if (!chunkToPlay) {
      console.warn(`[AudioPlayer] No chunk available to play for index ${index}, waiting for more...`);
      setWaitingForNextChunk(true);
      return;
    }

    console.log(`[AudioPlayer] Playing chunk ${index}`);
    setCurrentChunkIndex(index);
    isPlayingRef.current = true;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = chunkToPlay.buffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      console.log(`[AudioPlayer] Finished playing chunk ${index}`);

      const nextChunk = queueRef.current.find((c) => c.index === index + 1);
      if (nextChunk) {
        console.log(`[AudioPlayer] Moving to next chunk ${index + 1}`);
        playChunk(index + 1);
      } else {
        console.log(`[AudioPlayer] No more chunks available, waiting for next...`);
        setWaitingForNextChunk(true);
        isPlayingRef.current = false;
      }
    };

    source.start();
  };

  const togglePlayback = () => {
    if (!audioContextRef.current) return;

    if (isPlaying) {
      console.log(`[AudioPlayer] Pausing at chunk ${currentChunkIndex}`);
      audioContextRef.current.suspend();
      isPlayingRef.current = false;
    } else {
      console.log(`[AudioPlayer] Resuming from chunk ${currentChunkIndex}`);
      audioContextRef.current.resume();
      if (!isPlayingRef.current) {
        playChunk(currentChunkIndex);
      }
    }

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    audioChunks.forEach((chunk) => {
      if (chunk.audioUrl) {
        fetchAndDecodeChunk(chunk.audioUrl, chunk.index);
      }
    });
  }, [audioChunks]);

  return (
    <Box position="absolute" top="50%" right="-20px" transform="translateY(-50%)">
      {isLoading || (!isReady && !queueRef.current.length) ? (
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
      ) : (
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          onClick={togglePlayback}
          size="sm"
          colorScheme="blue"
          bg={isPlaying ? "blue.600" : "blue.500"}
          color="white"
          borderRadius="full"
          boxShadow="md"
          width="36px"
          height="36px"
        />
      )}
    </Box>
  );
};

export default AudioPlayer;
