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
  onPlayStateChange?: (messageId: string, isPlaying: boolean) => void;
  messageId: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioChunks = [], isLoading = false, onPlayStateChange = () => {},
messageId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [waitingForNextChunk, setWaitingForNextChunk] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<{ buffer: AudioBuffer; index: number }[]>([]);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
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

      if (!queueRef.current.some((c) => c.index === index)) {
        queueRef.current.push({ buffer, index });
        queueRef.current.sort((a, b) => a.index - b.index);
      }

      //console.log(`[AudioPlayer] Chunk ${index} decoded and added to queue`);

      if (!isReady) setIsReady(true);

      // If we were waiting for this chunk, resume playback
      if (waitingForNextChunk && index === currentChunkIndex + 1) {
        setWaitingForNextChunk(false);
        playChunk(index);
      }

    } catch (error) {
      console.error(`[AudioPlayer] Error decoding chunk ${index}:`, error);
    }
  };

  const playChunk = async (index: number) => {
    if (!audioContextRef.current) return;

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    const chunkToPlay = queueRef.current.find((c) => c.index === index);
    if (!chunkToPlay) {
      console.warn(`[AudioPlayer] No chunk available to play for index ${index}, waiting for more...`);
      setWaitingForNextChunk(true);
      return;
    }

    setCurrentChunkIndex(index);
    isPlayingRef.current = true;
    setIsPlaying(true); // Ensure play button remains pause

    const source = audioContextRef.current.createBufferSource();
    source.buffer = chunkToPlay.buffer;
    source.connect(audioContextRef.current.destination);
    sourceNodeRef.current = source;

    source.onended = () => {

      if (!isPlayingRef.current) return; // Stop if user has paused

      const nextChunk = queueRef.current.find((c) => c.index === index + 1);
      if (nextChunk) {
        playChunk(index + 1);
      } else {
        //No next chunk available, wait for more
        setWaitingForNextChunk(true);
      }
    };

    source.start();
  };

  const togglePlayback = () => {
    if (!audioContextRef.current) return;

    if (isPlaying) {
      //CD::console.log(`[AudioPlayer] Pausing at chunk ${currentChunkIndex}`);
      isPlayingRef.current = false;
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      onPlayStateChange(messageId, false);
    } else {
      //log(`[AudioPlayer] Resuming from chunk ${currentChunkIndex}`);
      isPlayingRef.current = true;
      setIsPlaying(true);
      onPlayStateChange(messageId, true);
      playChunk(currentChunkIndex);
    }
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
      {(!isReady && !queueRef.current.length) ? (
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
