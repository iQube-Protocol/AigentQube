// src/components/VoiceRecorder.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, Tooltip, useToast, Spinner } from '@chakra-ui/react';
import { Mic } from 'lucide-react';
import { VoiceService } from '../services/VoiceService';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  existingText?: string;
  apiKey: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscription, 
  disabled = false,
  existingText = '',
  apiKey
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceServiceRef = useRef<VoiceService>(new VoiceService({apiKey}));
  const toast = useToast();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  // Update voice service if API key changes
  useEffect(() => {
    voiceServiceRef.current = new VoiceService({apiKey});
  }, [apiKey]);

  const startRecording = async () => {
    console.log("Starting voice recording...");
    audioChunksRef.current = [];
    
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
              console.log("Audio blob details:", {
                size: audioBlob.size,
                type: audioBlob.type
              });
              
              const response = await voiceServiceRef.current.audioToText(audioBlob);
              console.log("Transcription API response:", response);
              
              if (response.success && response.text) {
                // Add the transcribed text to any existing text (via a callback)
                const newText = existingText 
                  ? `${existingText} ${response.text}`
                  : response.text;
                  
                console.log("Transcription successful:", response.text);
                
                // IMPORTANT: This was causing form submissions - use a timeout
                // to break the connection with the mouse/touch event
                setTimeout(() => {
                  onTranscription(newText);
                  setIsProcessing(false);
                }, 0);
              } else {
                throw new Error(response.error || 'Failed to transcribe audio');
              }
            } catch (apiError: any) {
              console.error("API error details:", apiError);
              setIsProcessing(false);
              throw new Error(`API request failed: ${apiError.message}`);
            }
          } catch (error: any) {
            console.error('Error processing audio:', error);
            setIsProcessing(false);
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
          }
        });
        
        mediaRecorderRef.current.stop();
      } else {
        console.log("MediaRecorder not available");
        resolve();
      }
    });
  };

  const toggleRecording = () => {
    if (disabled || isProcessing) {
      return;
    }
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Tooltip 
      label={
        isProcessing 
          ? "Processing voice..." 
          : isRecording 
            ? "Tap to stop recording" 
            : "Tap to start recording"
      } 
      placement="top"
    >
      <Box
        position="relative"
        width="40px" 
        height="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {isProcessing ? (
          // Show spinner in the same position as the mic button
          <Box
            borderRadius="full"
            width="40px"
            height="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="blue.500"
          >
            <Spinner size="sm" color="white" thickness="2px"  label=""
  aria-label="Processing audio" />
          </Box>
        ) : (
          // Toggle button: Mic when not recording, MicOff when recording
          <Box 
            as="button"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            borderRadius="full"
            p={2}
            bgColor={isRecording ? "red.500" : "blue.500"}
            color="white"
            _hover={{ 
              bgColor: isRecording ? "red.600" : "blue.600" 
            }}
            disabled={disabled}
            opacity={disabled ? 0.6 : 1}
            cursor={disabled ? "not-allowed" : "pointer"}
            onClick={toggleRecording}
            onTouchEnd={(e: React.TouchEvent<HTMLDivElement>) => {
              // Prevent default to avoid unintended behaviors
              e.preventDefault();
              toggleRecording();
            }}
            transition="all 0.2s"
            width="40px"
            height="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {isRecording ? <Mic size={18} /> : <Mic size={18} />}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default VoiceRecorder;