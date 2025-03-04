// src/services/VoiceService.ts
import { InferenceSession, Tensor } from 'onnxruntime-web';

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

interface ModelConfig {
  audio?: {
    sample_rate: number;
  };
  inference?: {
    noise_scale: number;
    length_scale: number;
    noise_w: number;
  };
  espeak?: {
    voice: string;
  };
  speaker_id_map?: Record<string, number>;
}

declare global {
  interface Window {
    createPiperPhonemize: (options?: any) => Promise<any>;
  }
}

export interface VoiceServiceOptions {
  apiKey?: string;
  useLocalTTS?: boolean;
  modelPath?: string;
  onReadyStateChange?: (isReady: boolean) => void;
}

export class VoiceService {
  private apiKey: string;
  private baseUrl: string = 'https://voice.chirptts.com/api';
  private minChunkLength = 60; // Minimum characters per chunk
  private maxChunkLength = 200; // Maximum characters per chunk

  // Local TTS properties
  private useLocalTTS: boolean = false;
  private isLocalTTSReady: boolean = false;
  private modelConfig: ModelConfig | null = null;
  private modulePhonemizer: any = null;
  private stdoutCaptureRef: string = "";
  private modelPath: string = '/';

  constructor(options: VoiceServiceOptions = {}) {
    this.apiKey = options.apiKey || '';
    this.useLocalTTS = options.useLocalTTS || false;
    this.modelPath = options.modelPath || '/';
    const onReadyStateChange = options.onReadyStateChange;
    
    if (this.modelPath && !this.modelPath.endsWith('/')) {
      this.modelPath += '/';
    }
    
    if (!this.apiKey && !this.useLocalTTS) {
      console.error('ChirpTTS API key is required when not using local TTS');
    }
    
    console.log(`VoiceService initialized with API key: ${this.apiKey ? "[PRESENT]" : "[MISSING]"}`);
    console.log(`Using base URL: ${this.baseUrl}`);
    console.log(`Using local TTS: ${this.useLocalTTS ? "Yes" : "No"}`);
    
    if (this.useLocalTTS) {
      // Initialize local TTS
      this.initializeLocalTTS().then(() => {
        // Notify when local TTS is ready
        if (onReadyStateChange) {
          onReadyStateChange(this.isLocalTTSReady);
        }
      });
    }
  }

  /**
   * Initialize the local TTS model and phonemizer
   */
  private async initializeLocalTTS(): Promise<boolean> {
    try {
      // Load model configuration
      await this.fetchModelConfig();
      
      // Load phonemizer module
      await this.loadPhonemizer();
      
      this.isLocalTTSReady = true;
      console.log('[VoiceService] Local TTS initialized successfully');
      return true;
    } catch (error) {
      console.error('[VoiceService] Local TTS initialization error:', error);
      this.isLocalTTSReady = false;
      return false;
    }
  }
  
  /**
   * Update the TTS mode (local or remote API)
   * @param useLocalTTS Whether to use local TTS (true) or remote API (false)
   * @param modelPath Optional path to local model files
   */
  public async updateTTSMode(useLocalTTS: boolean, modelPath?: string): Promise<boolean> {
    // Skip if the mode is already set correctly and local TTS is already initialized if needed
    if (this.useLocalTTS === useLocalTTS && (!useLocalTTS || this.isLocalTTSReady)) {
      return true;
    }
    
    this.useLocalTTS = useLocalTTS;
    console.log(`[VoiceService] Updated TTS mode: ${useLocalTTS ? "Local" : "Remote API"}`);
    
    // Update model path if provided
    if (modelPath) {
      this.modelPath = modelPath;
      if (!this.modelPath.endsWith('/')) {
        this.modelPath += '/';
      }
      console.log(`[VoiceService] Updated model path: ${this.modelPath}`);
    }
    
    // Initialize local TTS if needed
    if (useLocalTTS && !this.isLocalTTSReady) {
      return this.initializeLocalTTS();
    }
    
    return true;
  }
  
  /**
   * Check if the local TTS is ready
   */
  public isLocalReady(): boolean {
    return this.isLocalTTSReady;
  }
  
  /**
   * Fetch model configuration file
   */
  private async fetchModelConfig(): Promise<void> {
    try {
      const response = await fetch(`${this.modelPath}model.onnx.json`);
      if (!response.ok) {
        throw new Error(`Failed to load model configuration (${response.status})`);
      }
      
      this.modelConfig = await response.json();
      console.log('[VoiceService] Loaded model config:', this.modelConfig);
    } catch (error) {
      console.error('[VoiceService] Failed to load model config:', error);
      throw error;
    }
  }
  
  /**
   * Load the phonemizer script and initialize the module
   */
  private async loadPhonemizer(): Promise<void> {
    try {
      console.log('[VoiceService] Loading phonemizer script');
      
      // Create script element and load the phonemizer
      const script = document.createElement('script');
      script.src = `${this.modelPath}piper_phonemize.js`;
      script.async = true;
      
      // Wait for script to load
      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log('[VoiceService] Phonemizer script loaded successfully');
          resolve();
        };
        script.onerror = () => {
          console.error('[VoiceService] Failed to load phonemizer script');
          reject(new Error("Failed to load phonemizer script"));
        };
        document.body.appendChild(script);
      });
      
      // Initialize the module with custom print handler - exactly like the working code
      console.log('[VoiceService] Initializing phonemizer module');
      
      // Critical part: Match the exact handler setup from working code
      this.modulePhonemizer = await window.createPiperPhonemize({
        print: (data: string) => {
          console.log("[VoiceService] Captured stdout:", data);
          this.stdoutCaptureRef += data;
        },
        printErr: (message: string) => {
          console.error("[VoiceService] Error from phonemizer:", message);
        }
      });
      
      console.log('[VoiceService] Phonemizer module initialized successfully');
    } catch (error) {
      console.error('[VoiceService] Error loading phonemizer:', error);
      throw error;
    }
  }
  
  /**
   * Process text to get phoneme IDs
   */
  private phonemizeText(inputText: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      if (!this.modulePhonemizer) {
        reject(new Error("Phonemizer module not initialized"));
        return;
      }
      
      try {
        const module = this.modulePhonemizer;
        const language = this.modelConfig?.espeak?.voice || "en-us";
        
        // Critical fix: Clear the stdout capture string
        this.stdoutCaptureRef = "";
        
        const espeakDataPath = `/espeak-ng-data`; 
        
        console.log("[VoiceService] Running phonemizer with language:", language);
        console.log("[VoiceService] Using espeak data path:", espeakDataPath);
        console.log("[VoiceService] Input text length:", inputText.length);
        
        // Use exact same format as working code
        module.callMain([
          "-l", language,
          "--input", JSON.stringify([{text: inputText}]),
          "--espeak_data", "/espeak-ng-data"
        ]);
        
        // Give the phonemizer a moment to finish and capture output
        setTimeout(() => {
          // Parse the captured stdout to get phoneme IDs
          const stdoutJson = this.stdoutCaptureRef;
          console.log("[VoiceService] Phonemizer raw output:", stdoutJson);
          
          if (!stdoutJson) {
            reject(new Error("No output from phonemizer"));
            return;
          }
          
          try {
            const result = JSON.parse(stdoutJson);
            console.log("[VoiceService] Successfully parsed phonemizer output");
            
            if (Array.isArray(result.phoneme_ids)) {
              console.log(`[VoiceService] Got ${result.phoneme_ids.length} phoneme IDs`);
              resolve(result.phoneme_ids);
            } else {
              reject(new Error("No phoneme_ids in result"));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse phonemizer output: ${parseError}`));
          }
        }, 100); // Small delay to ensure stdout is captured
      } catch (error) {
        console.error("[VoiceService] Error in phonemization:", error);
        reject(error);
      }
    });
  }
  
  /**
   * Generate speech using the local ONNX model
   */
  private async generateLocalSpeech(text: string): Promise<TextToSpeechResponse> {
    if (!this.isLocalTTSReady) {
      return {
        success: false,
        error: "Local TTS is not initialized"
      };
    }
    
    try {
      // Step 1: Get phoneme IDs
      console.log('[VoiceService] Local TTS - Phonemizing text:', text);
      const phonemeIds = await this.phonemizeText(text);
      
      // Step 2: Load ONNX model
      console.log('[VoiceService] Local TTS - Loading ONNX model');
      const session = await InferenceSession.create(`${this.modelPath}model.onnx`, {
        executionProviders: ["webgpu", "wasm"],
      });
      console.log('[VoiceService] Local TTS - Model loaded successfully');
      
      // Step 3: Prepare model inputs
      const sampleRate = this.modelConfig?.audio?.sample_rate || 22050;
      const noiseScale = this.modelConfig?.inference?.noise_scale || 0.667;
      const lengthScale = this.modelConfig?.inference?.length_scale || 1.0;
      const noiseW = this.modelConfig?.inference?.noise_w || 0.8;
      
      const feeds: Record<string, Tensor> = {
        input: new Tensor("int64", new BigInt64Array(phonemeIds.map(id => BigInt(id))), [1, phonemeIds.length]),
        input_lengths: new Tensor("int64", [BigInt(phonemeIds.length)], [1]),
        scales: new Tensor("float32", [noiseScale, lengthScale, noiseW], [3])
      };
      
      // Add the sid property if needed
      if (this.modelConfig?.speaker_id_map && Object.keys(this.modelConfig.speaker_id_map).length > 0) {
        feeds.sid = new Tensor("int64", [BigInt(0)], [1]);
      }
      
      // Step 4: Run inference
      console.log('[VoiceService] Local TTS - Running inference');
      const results = await session.run(feeds);
      
      // Step 5: Process the results
      const audioData = results.output.data as Float32Array;
      console.log(`[VoiceService] Local TTS - Generated ${audioData.length} audio samples`);
      
      // Create audio buffer and URL
      const audioUrl = this.createAudioUrl(audioData, sampleRate);
      
      return {
        success: true,
        audioUrl
      };
    } catch (error) {
      console.error('[VoiceService] Local TTS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Create an audio URL from raw audio data
   */
  private createAudioUrl(audioData: Float32Array, sampleRate: number): string {
    // Create WAV file from audio buffer
    const wavBuffer = this.createWAV(audioData, sampleRate);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    return url;
  }
  
  /**
   * Convert audio to text
   */
  public async audioToText(audioBlob: Blob): Promise<AudioToTextResponse> {
    console.log(`[VoiceService] audioToText: Starting conversion of ${audioBlob.size} bytes, type: ${audioBlob.type}`);
    
    // For now, we'll always use the remote API for audio-to-text
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
    
    // Use local TTS if enabled and ready
    if (this.useLocalTTS && this.isLocalTTSReady) {
      console.log('[VoiceService] Using local TTS for text-to-speech');
      return this.generateLocalSpeech(text);
    }
    
    // Fall back to API if local TTS is not available
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

  /**
   * Function to create WAV file from PCM data
   */
  private createWAV(pcmData: Float32Array, sampleRate: number): ArrayBuffer {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const bufferLength = pcmData.length;
    const headerLength = 44;
    
    // Create buffer for WAV file
    const buffer = new ArrayBuffer(headerLength + bufferLength * bytesPerSample);
    const view = new DataView(buffer);
    
    // Write WAV header
    // "RIFF" chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bufferLength * bytesPerSample, true);
    this.writeString(view, 8, 'WAVE');
    
    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk1size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true);  // SampleRate
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true);   // BlockAlign
    view.setUint16(34, 8 * bytesPerSample, true);  // BitsPerSample
    
    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, bufferLength * bytesPerSample, true); // Subchunk2Size
    
    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < bufferLength; i++) {
      const sample = Math.max(-1, Math.min(1, pcmData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return buffer;
  }
  
  /**
   * Helper function to write string to DataView
   */
  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}