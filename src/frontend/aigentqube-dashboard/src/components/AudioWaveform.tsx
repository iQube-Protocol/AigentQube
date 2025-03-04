// src/components/AudioWaveform.tsx
import React, { useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';

interface AudioWaveformProps {
  isActive: boolean;
  color?: string;
  height?: number;
  width?: number;
  barCount?: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  color = 'blue.500',
  height = 20,
  width = 80,
  barCount = 5
}) => {
  const requestRef = useRef<number>();
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Initialize bars array with nulls
    barsRef.current = Array(barCount).fill(null);
    
    let lastFrameTime = 0;
    
    const animate = (time: number) => {
      if (time - lastFrameTime > 100) { // Update every 100ms
        lastFrameTime = time;
        
        if (isActive) {
          // Animate each bar with random heights
          barsRef.current.forEach((bar) => {
            if (bar) {
              const randomHeight = Math.random() * height;
              bar.style.height = `${Math.max(4, randomHeight)}px`;
            }
          });
        } else {
          // Set all bars to minimal height when inactive
          barsRef.current.forEach((bar) => {
            if (bar) {
              bar.style.height = '4px';
            }
          });
        }
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, height, barCount]);

  // Function to save refs to the bars
  const saveBarRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      barsRef.current[index] = el;
    }
  };

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      gap={1}
      height={`${height}px`}
      width={`${width}px`}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <Box
          key={`bar-${index}`}
          ref={(el) => saveBarRef(el, index)}
          width="3px"
          height="4px"
          backgroundColor={color}
          borderRadius="sm"
          transition="height 0.1s ease-in-out"
        />
      ))}
    </Flex>
  );
};

export default AudioWaveform;