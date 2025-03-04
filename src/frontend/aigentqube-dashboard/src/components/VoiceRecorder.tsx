// src/components/SimpleVoiceRecorder.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Tooltip, useToast } from '@chakra-ui/react';
import { Mic } from 'lucide-react';
import { VoiceService } from '../services/VoiceService';

interface SimpleVoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  existingText?: string;
  apiKey: string;
}

const VoiceRecorder: React.FC<SimpleVoiceRecorderProps> = ({ 
  onTranscription, 
  disabled = false,
  existingText = '',
  apiKey
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceServiceRef = useRef<VoiceService>(new VoiceService(apiKey));
  const toast = useToast();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  // Update voice service if API key changes
  useEffect(() => {
    console.log("Voice API Key:", apiKey ? "Set (not showing for security)" : "Not set");
    voiceServiceRef.current = new VoiceService(apiKey);
  }, [apiKey]);

  const startRecording = async () => {
    console.log("Starting voice recording...");
    audioChunksRef.current = [];
    setRecordedBlob(null);
    
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted:", stream.active);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      console.log("MediaRecorder created with mimeType:", mediaRecorderRef.current.mimeType);
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("Recording started");
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Error',
        description: 'Unable to access your microphone. Please check permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      console.log("No active recording to stop");
      return;
    }

    console.log("Stopping recording...");
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.addEventListener('stop', async () => {
          try {
            setIsProcessing(true);
            console.log(`Recording stopped. Collected ${audioChunksRef.current.length} chunks.`);
            
            // Create audio blob from chunks
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            console.log(`Created audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
            
            // Process with API
            console.log("Sending audio to transcription service...");
            console.log("API key present:", !!apiKey);
            
            try {
              // Log the request details
              const blobCopy = audioBlob.slice(0, audioBlob.size);
              console.log("Audio blob details:", {
                size: blobCopy.size,
                type: blobCopy.type
              });
              
              const response = await voiceServiceRef.current.audioToText(audioBlob);
              console.log("Transcription API response:", response);
              
              if (response.success && response.text) {
                // Add the transcribed text to any existing text
                const newText = existingText 
                  ? `${existingText} ${response.text}`
                  : response.text;
                  
                console.log("Transcription successful:", response.text);
                onTranscription(newText);
              } else {
                throw new Error(response.error || 'Failed to transcribe audio');
              }
            } catch (apiError: any) {
              console.error("API error details:", apiError);
              throw new Error(`API request failed: ${apiError.message}`);
            }
          } catch (error: any) {
            console.error('Error processing audio:', error);
            toast({
              title: 'Transcription Error',
              description: error.message || 'Failed to transcribe audio',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          } finally {
            // Stop all audio tracks
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stream.getTracks().forEach(track => {
                console.log(`Stopping audio track: ${track.id}`);
                track.stop();
              });
            }
            setIsRecording(false);
            setIsProcessing(false);
            resolve();
          }
        });
        
        mediaRecorderRef.current.stop();
      } else {
        console.log("MediaRecorder not available");
        resolve();
      }
    });
  };

  const handleMouseDown = () => {
    if (!disabled) {
      startRecording();
    }
  };
  
  const handleMouseUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // Also handle touch events for mobile
  const handleTouchStart = () => {
    if (!disabled) {
      startRecording();
    }
  };
  
  const handleTouchEnd = () => {
    if (isRecording) {
      stopRecording();
    }
  };


  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Tooltip label="Hold to record voice" placement="top">
        <Box 
          as="button"
          aria-label="Record voice"
          borderRadius="full"
          p={2}
          bgColor={isRecording ? "red.500" : "blue.500"}
          color="white"
          _hover={{ 
            bgColor: isRecording ? "red.600" : "blue.600" 
          }}
          disabled={disabled || isProcessing}
          opacity={disabled || isProcessing ? 0.6 : 1}
          cursor={disabled || isProcessing ? "not-allowed" : "pointer"}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={isRecording ? handleMouseUp : undefined}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          transition="all 0.2s"
        >
          <Mic size={18} />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default VoiceRecorder;