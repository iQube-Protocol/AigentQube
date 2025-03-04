// src/services/VoiceService.ts
export interface AudioToTextResponse {
    success: boolean;
    text?: string;
    error?: string;
  }
  
  export interface TextToSpeechResponse {
    success: boolean;
    audioUrl?: string;
    error?: string;
  }
  
  export interface AudioChunk {
    id: string;
    text: string;
    audioUrl: string | null;
    isLoading: boolean;
    error: string | null;
    index: number;
  }
  
  export class VoiceService {
    private apiKey: string;
    private baseUrl: string = 'https://voice.chirptts.com/api';
    private minChunkLength = 60; // Minimum characters per chunk
    private maxChunkLength = 200; // Maximum characters per chunk
  
    constructor(apiKey: string) {
      this.apiKey = apiKey;
      console.log(`VoiceService initialized with API key: ${apiKey ? "[PRESENT]" : "[MISSING]"}`);
      console.log(`Using base URL: ${this.baseUrl}`);
      
      if (!this.apiKey) {
        console.error('ChirpTTS API key is required');
      }
    }
  
    /**
     * Convert audio to text
     */
    public async audioToText(audioBlob: Blob): Promise<AudioToTextResponse> {
      console.log(`[VoiceService] audioToText: Starting conversion of ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        
        console.log(`[VoiceService] audioToText: FormData created with file attachment`);
        
        // Log headers being sent
        const headers = {
          'X-API-KEY': this.apiKey.substring(0, 4) + '...'  // Log just part of the key for security
        };
        console.log(`[VoiceService] audioToText: Headers:`, headers);
        
        console.log(`[VoiceService] audioToText: Sending request to ${this.baseUrl}/audio-to-text`);
        
        try {
          const response = await fetch(`${this.baseUrl}/audio-to-text`, {
            method: 'POST',
            headers: {
              'X-API-KEY': this.apiKey
            },
            body: formData
          });
          
          if (!response.ok) {
            // Try to get error details from the response
            let errorDetails = "";
            try {
              const errorData = await response.text();
              errorDetails = errorData;
            } catch (e) {
              errorDetails = "Could not parse error details";
            }
            
            console.error(`[VoiceService] audioToText: API error: ${response.status} ${response.statusText}, Details: ${errorDetails}`);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
  
          console.log(`[VoiceService] audioToText: Parsing response JSON`);
          const data = await response.json();
          console.log(`[VoiceService] audioToText: Response data:`, data);
          
          return {
            success: true,
            text: data.text
          };
        } catch (fetchError: any) {
          
          // Try to diagnose specific network issues
          if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
            console.error(`[VoiceService] audioToText: Network failure. Possible causes: CORS issues, network connectivity, or API endpoint unavailable`);
            
            // Check if we're in a secure context trying to access insecure content
            if (window.location.protocol === 'https:' && this.baseUrl.startsWith('http:')) {
              console.error(`[VoiceService] audioToText: Attempting to access HTTP endpoint from HTTPS context. This is likely blocked by the browser.`);
            }
            
            // Try to check if CORS is the issue
            console.error(`[VoiceService] audioToText: If this is a CORS issue, you may need to set up a proxy or ensure the API enables CORS for your domain`);
          }
          
          throw fetchError;
        }
      } catch (error: any) {
        console.error('[VoiceService] Audio-to-Text Error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  
    /**
     * Convert text to speech
     */
    public async textToSpeech(text: string, voice: string = 'en_US-lessac-medium'): Promise<TextToSpeechResponse> {
      console.log(`[VoiceService] textToSpeech: Starting conversion for text (${text.length} chars) with voice ${voice}`);
      
      try {
        const formData = new URLSearchParams();
        formData.append('text', text);
        formData.append('voice', voice);
        
        console.log(`[VoiceService] textToSpeech: Request params created`);
        
        // Log request details
        console.log(`[VoiceService] textToSpeech: Sending request to ${this.baseUrl}/text-to-speech`);
        
        const startTime = Date.now();
        
        try {
          const response = await fetch(`${this.baseUrl}/text-to-speech`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-API-KEY': this.apiKey
            },
            body: formData
          });
          
          const endTime = Date.now();
          console.log(`[VoiceService] textToSpeech: Network request completed in ${endTime - startTime}ms`);
          console.log(`[VoiceService] textToSpeech: Response status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            // Try to get error details from the response
            let errorDetails = "";
            try {
              const errorData = await response.text();
              errorDetails = errorData;
            } catch (e) {
              errorDetails = "Could not parse error details";
            }
            
            console.error(`[VoiceService] textToSpeech: API error: ${response.status} ${response.statusText}, Details: ${errorDetails}`);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
  
          // Get the audio blob
          const audioBlob = await response.blob();
          console.log(`[VoiceService] textToSpeech: Received audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
          
          // Create an object URL for the audio
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log(`[VoiceService] textToSpeech: Created object URL: ${audioUrl}`);
          
          return {
            success: true,
            audioUrl
          };
        } catch (fetchError: any) {
          console.error(`[VoiceService] textToSpeech: Fetch error:`, fetchError);
          
          // Try to diagnose specific network issues
          if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
            console.error(`[VoiceService] textToSpeech: Network failure. Possible causes: CORS issues, network connectivity, or API endpoint unavailable`);
            
            // Check if we're in a secure context trying to access insecure content
            if (window.location.protocol === 'https:' && this.baseUrl.startsWith('http:')) {
              console.error(`[VoiceService] textToSpeech: Attempting to access HTTP endpoint from HTTPS context. This is likely blocked by the browser.`);
            }
            
            // Try to check if CORS is the issue
            console.error(`[VoiceService] textToSpeech: If this is a CORS issue, you may need to set up a proxy or ensure the API enables CORS for your domain`);
          }
          
          throw fetchError;
        }
      } catch (error: any) {
        console.error('[VoiceService] Text-to-Speech Error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  
 /**
 * Stream audio generation for long text by breaking it into chunks
 * @param text Full text to convert to audio
 * @param onChunkProcessed Callback when a chunk is processed
 */
 public async streamAudio(
    text: string,
    onChunkProcessed: (chunk: AudioChunk, isComplete: boolean) => void
  ): Promise<AudioChunk[]> {
    // Improved text chunking: Ensures the first chunk has at least 12 words
    const chunks = this.splitTextIntoChunks(text, { firstChunkMinWords: 12 });
    console.log(`[VoiceService] streamAudio: Split text into ${chunks.length} chunks for streaming audio`);
  
    // Ensure TypeScript knows these types
    const audioChunks: AudioChunk[] = chunks.map((text, index) => ({
      id: `chunk-${index}-${Date.now()}`,
      text,
      audioUrl: '',
      isLoading: true,
      error: '',
      index
    }));
  
    console.log(`[VoiceService] streamAudio: Created ${audioChunks.length} initial chunk objects`);
  
    // Store processed chunks
    const results: AudioChunk[] = [...audioChunks];
  
    // Process chunks sequentially
    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`[VoiceService] streamAudio: Processing chunk ${i + 1}/${chunks.length}: "${chunks[i].substring(0, 30)}..."`);
  
        // Fetch TTS audio for the chunk
        const response = await this.textToSpeech(chunks[i]);
  
        if (response.success && typeof response.audioUrl === 'string') {
          console.log(`[VoiceService] streamAudio: Successfully generated audio for chunk ${i}`);
  
          // Store audio URL
          results[i] = {
            ...results[i],
            audioUrl: response.audioUrl,
            isLoading: false
          };
        } else {
          // Handle error
          console.error(`[VoiceService] streamAudio: Failed to generate audio for chunk ${i}: ${response.error || 'Unknown error'}`);
          results[i] = {
            ...results[i],
            isLoading: false,
            error: response.error || 'Failed to generate audio'
          };
        }
  
        // Notify listener that a chunk is ready
        onChunkProcessed(results[i], i === chunks.length - 1);
        
      } catch (error) {
        console.error(`[VoiceService] streamAudio: Error processing chunk ${i}:`, error);
        results[i] = {
          ...results[i],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
  
        // Notify even if there's an error
        onChunkProcessed(results[i], i === chunks.length - 1);
      }
    }
  
    console.log(`[VoiceService] streamAudio: Completed processing all ${chunks.length} chunks`);
    return results;
  }
  
    
    /**
     * Split text into logical chunks for better audio processing
     */
    private splitTextIntoChunks(text: string, options: { firstChunkMinWords?: number } = {}): string[] {
        const words = text.split(/\s+/);
        const minWords = options.firstChunkMinWords || 0;
      
        let chunks: string[] = [];
        let currentChunk: string[] = [];
      
        words.forEach((word, index) => {
          currentChunk.push(word);
      
          // Ensure first chunk is large enough
          if (index >= minWords && (currentChunk.length >= 10 || word.endsWith('.'))) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
          }
        });
      
        // Add remaining words as the last chunk
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join(' '));
        }
      
        return chunks;
      }
      
    
    /**
     * Break a long sentence into smaller chunks at logical points
     */
    private breakIntoSmallChunks(longSentence: string): string[] {
      const chunks: string[] = [];
      const phraseDelimiters = /(?<=[,;:])\s+/g;
      const phrases = longSentence.split(phraseDelimiters);
      
      let currentChunk = '';
      
      for (const phrase of phrases) {
        if (!phrase.trim()) continue;
        
        if (currentChunk && (currentChunk.length + phrase.length > this.maxChunkLength)) {
          chunks.push(currentChunk);
          currentChunk = phrase;
        } else {
          currentChunk = currentChunk ? `${currentChunk} ${phrase}` : phrase;
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If we still have chunks that are too long, break by words
      return chunks.flatMap(chunk => 
        chunk.length > this.maxChunkLength ? this.breakByWords(chunk) : chunk
      );
    }
    
    /**
     * Break text by words if phrases are still too long
     */
    private breakByWords(text: string): string[] {
      const chunks: string[] = [];
      const words = text.split(' ');
      let currentChunk = '';
      
      for (const word of words) {
        if (currentChunk && (currentChunk.length + word.length + 1 > this.maxChunkLength)) {
          chunks.push(currentChunk);
          currentChunk = word;
        } else {
          currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      return chunks;
    }
    
    /**
     * Optimize chunks by combining very short ones
     */
    private optimizeChunks(chunks: string[]): string[] {
      if (chunks.length <= 1) return chunks;
      
      const optimized: string[] = [];
      let current = chunks[0];
      
      for (let i = 1; i < chunks.length; i++) {
        const next = chunks[i];
        
        // If current chunk is too short and combining won't exceed max length
        if (current.length < this.minChunkLength && 
            current.length + next.length <= this.maxChunkLength) {
          current = `${current} ${next}`;
        } else {
          optimized.push(current);
          current = next;
        }
      }
      
      // Add the last chunk
      if (current) {
        optimized.push(current);
      }
      
      return optimized;
    }
  }