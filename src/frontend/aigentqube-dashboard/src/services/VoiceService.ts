// src/services/SimpleVoiceService.ts
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
  
  export class VoiceService {
    private apiKey: string;
    private baseUrl: string = 'https://voice.chirptts.com/api';
  
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
        
        // Create a network monitor
        const startTime = Date.now();
        
        try {
          const response = await fetch(`${this.baseUrl}/audio-to-text`, {
            method: 'POST',
            headers: {
              'X-API-KEY': this.apiKey
            },
            body: formData
          });
          
          const endTime = Date.now();
          console.log(`[SimpleVoiceService] audioToText: Network request completed in ${endTime - startTime}ms`);
          console.log(`[SimpleVoiceService] audioToText: Response status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            // Try to get error details from the response
            let errorDetails = "";
            try {
              const errorData = await response.text();
              errorDetails = errorData;
            } catch (e) {
              errorDetails = "Could not parse error details";
            }
            
            console.error(`[SimpleVoiceService] audioToText: API error: ${response.status} ${response.statusText}, Details: ${errorDetails}`);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
  
          console.log(`[SimpleVoiceService] audioToText: Parsing response JSON`);
          const data = await response.json();
          console.log(`[SimpleVoiceService] audioToText: Response data:`, data);
          
          return {
            success: true,
            text: data.text
          };
        } catch (fetchError: any) {
          console.error(`[SimpleVoiceService] audioToText: Fetch error:`, fetchError);
          
          // Try to diagnose specific network issues
          if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
            console.error(`[SimpleVoiceService] audioToText: Network failure. Possible causes: CORS issues, network connectivity, or API endpoint unavailable`);
            
            // Check if we're in a secure context trying to access insecure content
            if (window.location.protocol === 'https:' && this.baseUrl.startsWith('http:')) {
              console.error(`[SimpleVoiceService] audioToText: Attempting to access HTTP endpoint from HTTPS context. This is likely blocked by the browser.`);
            }
            
            // Try to check if CORS is the issue
            console.error(`[SimpleVoiceService] audioToText: If this is a CORS issue, you may need to set up a proxy or ensure the API enables CORS for your domain`);
          }
          
          throw fetchError;
        }
      } catch (error: any) {
        console.error('[SimpleVoiceService] Audio-to-Text Error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  
    /**
     * Convert text to speech
     */
    public async textToSpeech(text: string, voice: string = 'en_US-lessac-high'): Promise<TextToSpeechResponse> {
      console.log(`[SimpleVoiceService] textToSpeech: Starting conversion for text (${text.length} chars) with voice ${voice}`);
      
      try {
        const formData = new URLSearchParams();
        formData.append('text', text);
        formData.append('voice', voice);
        
        console.log(`[SimpleVoiceService] textToSpeech: Request params created`);
        
        // Log request details
        console.log(`[SimpleVoiceService] textToSpeech: Sending request to ${this.baseUrl}/text-to-speech`);
        
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
          console.log(`[SimpleVoiceService] textToSpeech: Network request completed in ${endTime - startTime}ms`);
          console.log(`[SimpleVoiceService] textToSpeech: Response status: ${response.status} ${response.statusText}`);
          
          if (!response.ok) {
            // Try to get error details from the response
            let errorDetails = "";
            try {
              const errorData = await response.text();
              errorDetails = errorData;
            } catch (e) {
              errorDetails = "Could not parse error details";
            }
            
            console.error(`[SimpleVoiceService] textToSpeech: API error: ${response.status} ${response.statusText}, Details: ${errorDetails}`);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
  
          // Get the audio blob
          const audioBlob = await response.blob();
          console.log(`[SimpleVoiceService] textToSpeech: Received audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
          
          // Create an object URL for the audio
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log(`[SimpleVoiceService] textToSpeech: Created object URL: ${audioUrl}`);
          
          return {
            success: true,
            audioUrl
          };
        } catch (fetchError: any) {
          console.error(`[SimpleVoiceService] textToSpeech: Fetch error:`, fetchError);
          
          // Try to diagnose specific network issues
          if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
            console.error(`[SimpleVoiceService] textToSpeech: Network failure. Possible causes: CORS issues, network connectivity, or API endpoint unavailable`);
            
            // Check if we're in a secure context trying to access insecure content
            if (window.location.protocol === 'https:' && this.baseUrl.startsWith('http:')) {
              console.error(`[SimpleVoiceService] textToSpeech: Attempting to access HTTP endpoint from HTTPS context. This is likely blocked by the browser.`);
            }
            
            // Try to check if CORS is the issue
            console.error(`[SimpleVoiceService] textToSpeech: If this is a CORS issue, you may need to set up a proxy or ensure the API enables CORS for your domain`);
          }
          
          throw fetchError;
        }
      } catch (error: any) {
        console.error('[SimpleVoiceService] Text-to-Speech Error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  
    /**
     * Stream audio for a piece of text in chunks
     */
    public async streamText(
      text: string, 
      onChunkProcessed: (chunk: {
        index: number;
        text: string;
        audioUrl: string | null;
        isLoading: boolean;
        error: string | null;
      }, isComplete: boolean) => void
    ): Promise<boolean> {
      // Split text into logical chunks (sentences)
      const textChunks = this.splitTextIntoChunks(text);
      console.log(`[SimpleVoiceService] streamText: Split text into ${textChunks.length} chunks`);
      
      // Process each chunk in sequence
      for (let i = 0; i < textChunks.length; i++) {
        try {
          console.log(`[SimpleVoiceService] streamText: Processing chunk ${i+1}/${textChunks.length}`);
          
          // Notify that processing is starting for this chunk
          onChunkProcessed({
            index: i,
            text: textChunks[i],
            audioUrl: null,
            isLoading: true,
            error: null
          }, false);
          
          // Generate audio for this chunk
          const response = await this.textToSpeech(textChunks[i]);
          
          if (response.success && response.audioUrl) {
            // Update with processed chunk
            onChunkProcessed({
              index: i,
              text: textChunks[i],
              audioUrl: response.audioUrl,
              isLoading: false,
              error: null
            }, i === textChunks.length - 1);
          } else {
            // Mark as error
            onChunkProcessed({
              index: i,
              text: textChunks[i],
              audioUrl: null,
              isLoading: false,
              error: response.error || 'Failed to generate audio'
            }, i === textChunks.length - 1);
          }
        } catch (error) {
          // Handle error
          onChunkProcessed({
            index: i,
            text: textChunks[i],
            audioUrl: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, i === textChunks.length - 1);
        }
      }
      
      return true;
    }
  
    /**
     * Split text into logical chunks (sentences) for streaming
     */
    private splitTextIntoChunks(text: string): string[] {
      // Simple sentence splitting
      const sentenceDelimiters = /(?<=[.!?])\s+(?=[A-Z])/g;
      
      // Split by sentence delimiters
      let sentences = text.split(sentenceDelimiters);
      
      // If we have very long sentences, break them by other punctuation
      sentences = sentences.flatMap(sentence => {
        if (sentence.length > 200) {
          // Break at commas, colons, etc.
          return sentence.split(/(?<=[,;:])\s+/).filter(s => s.trim().length > 0);
        }
        return sentence;
      });
      
      return sentences.filter(s => s.trim().length > 0);
    }
  }