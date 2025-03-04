// src/services/VoiceService.ts
// Optimized version with persistent model loading
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
  
  // Added persistent model and session handling
  private onnxSession: InferenceSession | null = null;
  private isModelLoading: boolean = false;
  private modelLoadPromise: Promise<boolean> | null = null;

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
      this.modelLoadPromise = this.initializeLocalTTS().then(ready => {
        // Notify when local TTS is ready
        if (onReadyStateChange) {
          onReadyStateChange(ready);
        }
        return ready;
      });
    }
  }

  /**
   * Initialize the local TTS model and phonemizer
   */
  private async initializeLocalTTS(): Promise<boolean> {
    // Prevent multiple simultaneous loads
    if (this.isModelLoading) {
      console.log('[VoiceService] Model loading already in progress, waiting...');
      return this.modelLoadPromise as Promise<boolean>;
    }
    
    // Skip if already initialized
    if (this.isLocalTTSReady && this.onnxSession) {
      console.log('[VoiceService] Local TTS already initialized');
      return true;
    }
    
    try {
      this.isModelLoading = true;
      
      // Load model configuration
      await this.fetchModelConfig();
      
      // Load phonemizer module if not already loaded
      if (!this.modulePhonemizer) {
        await this.loadPhonemizer();
      }
      
      // Load ONNX model if not already loaded
      if (!this.onnxSession) {
        console.log('[VoiceService] Loading ONNX model');
        this.onnxSession = await InferenceSession.create(`${this.modelPath}model.onnx`, {
          executionProviders: ["webgpu", "wasm"],
        });
        console.log('[VoiceService] ONNX model loaded successfully');
      }
      
      this.isLocalTTSReady = true;
      this.isModelLoading = false;
      console.log('[VoiceService] Local TTS initialized successfully');
      return true;
    } catch (error) {
      console.error('[VoiceService] Local TTS initialization error:', error);
      this.isLocalTTSReady = false;
      this.isModelLoading = false;
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
      
      // Reset model state if path changed
      this.isLocalTTSReady = false;
      this.onnxSession = null;
    }
    
    // Initialize local TTS if needed
    if (useLocalTTS && !this.isLocalTTSReady) {
      this.modelLoadPromise = this.initializeLocalTTS();
      return this.modelLoadPromise;
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
   * Cleanly dispose resources when no longer needed
   */
  public async dispose(): Promise<void> {
    if (this.onnxSession) {
      try {
        console.log('[VoiceService] Disposing ONNX session');
        await this.onnxSession.release();
        this.onnxSession = null;
      } catch (error) {
        console.error('[VoiceService] Error disposing ONNX session:', error);
      }
    }
    
    // Clear other resources
    this.isLocalTTSReady = false;
    this.modelConfig = null;
    this.modulePhonemizer = null;
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
      
      // Step 2: Use already loaded ONNX model
      if (!this.onnxSession) {
        console.log('[VoiceService] Local TTS - Model not loaded, attempting to load');
        await this.initializeLocalTTS();
        
        if (!this.onnxSession) {
          throw new Error("Failed to load ONNX model");
        }
      }
      
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
      const results = await this.onnxSession.run(feeds);
      
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

  public normalizeText(text: string): string {
    /**
     * Cleans and normalizes the input text for TTS processing.
     * - Removes excessive whitespace
     * - Ensures proper punctuation spacing
     * - Converts to ASCII-friendly format where possible
     */
    text = text.trim();
    text = text.replace(/\s+/g, ' ');  // Normalize whitespace
    text = text.replace(/([,.!?])/g, ' $1 ');  // Ensure spacing around punctuation
    text = text.replace(/\s{2,}/g, ' ');  // Remove multiple spaces
    text = text.replace(/\*/g, '');  // Remove asterisks
    text = text.replace(/Qube/gi, 'cube');  // Convert "IQubes" to "i-cubes"
    text = text.replace(/Z/g, 'zee');
    return text.trim();
  }

  /**
   * Convert text to speech
   */
  public async textToSpeech(textInput: string, voice: string = 'en_US-lessac-medium'): Promise<TextToSpeechResponse> {
    console.log(`[VoiceService] textToSpeech: Starting conversion for text (${textInput.length} chars) with voice ${voice}`);
    const text = this.normalizeText(textInput)
    // Use local TTS if enabled and ready
    if (this.useLocalTTS) {
      // If not ready, wait for initialization to complete
      if (!this.isLocalTTSReady && this.modelLoadPromise) {
        console.log('[VoiceService] Waiting for local TTS to initialize');
        await this.modelLoadPromise;
      }
      
      if (this.isLocalTTSReady) {
        console.log('[VoiceService] Using local TTS for text-to-speech');
        return this.generateLocalSpeech(text);
      } else {
        console.warn('[VoiceService] Local TTS initialization failed, falling back to API');
      }
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
 * Split text into natural chunks for better audio processing
 * Prioritizes complete sentences while maintaining reasonable chunk sizes
 */
private splitTextIntoChunks(text: string, options: { firstChunkMinWords?: number } = {}): string[] {
    // Set minimum sizes and thresholds
    const minWords = Math.max(3, options.firstChunkMinWords || 3);
    const idealSentenceSize = 30; // Maximum words in a sentence before considering splitting
    const maxChunkSize = this.maxChunkLength; // Character limit
  
    // Split text into sentences first
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    
    let currentChunk: string[] = [];
    let currentWordCount = 0;
    
    // Process each sentence
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;
      
      // Count words in this sentence
      const sentenceWords = sentence.split(/\s+/);
      const sentenceWordCount = sentenceWords.length;
      
      // Case 1: Current chunk is empty - start a new chunk with this sentence
      if (currentChunk.length === 0) {
        currentChunk.push(sentence);
        currentWordCount = sentenceWordCount;
        
        // If this is the last sentence or it's already a substantial chunk, finalize it
        if (i === sentences.length - 1 || sentenceWordCount >= idealSentenceSize) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [];
          currentWordCount = 0;
        }
        continue;
      }
      
      // Case 2: Check if adding this sentence would exceed our ideal size
      const combinedLength = currentChunk.join(' ').length + 1 + sentence.length;
      const combinedWordCount = currentWordCount + sentenceWordCount;
      
      if (combinedLength > maxChunkSize || combinedWordCount > idealSentenceSize * 1.5) {
        // Adding this sentence would make the chunk too large
        // Finalize current chunk if it meets minimum requirements
        if (currentWordCount >= minWords) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [sentence];
          currentWordCount = sentenceWordCount;
        } else {
          // Current chunk is too small, so add this sentence anyway
          currentChunk.push(sentence);
          currentWordCount += sentenceWordCount;
        }
      } else {
        // This sentence fits well with the current chunk
        currentChunk.push(sentence);
        currentWordCount += sentenceWordCount;
      }
      
      // If this is the last sentence, finalize the chunk
      if (i === sentences.length - 1 && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
      }
    }
    
    // If we have very short chunks (less than minWords), try to combine them
    if (chunks.length > 1) {
      return this.optimizeChunkSizes(chunks, minWords, maxChunkSize);
    }
    
    return chunks;
  }
  
  /**
   * Optimize chunks by ensuring minimum size and avoiding tiny fragments
   */
  private optimizeChunkSizes(chunks: string[], minWords: number, maxSize: number): string[] {
    const optimized: string[] = [];
    let current = chunks[0];
    let currentWordCount = current.split(/\s+/).length;
    
    for (let i = 1; i < chunks.length; i++) {
      const next = chunks[i];
      const nextWordCount = next.split(/\s+/).length;
      
      // If current chunk is too small and combining won't exceed max length
      if (currentWordCount < minWords && 
          current.length + next.length + 1 <= maxSize) {
        current = `${current} ${next}`;
        currentWordCount += nextWordCount;
      } else {
        // If the next chunk is too small and this is the second-to-last chunk,
        // see if we can combine it with the current chunk
        if (i === chunks.length - 1 && nextWordCount < minWords && 
            current.length + next.length + 1 <= maxSize) {
          current = `${current} ${next}`;
        } else {
          optimized.push(current);
          current = next;
          currentWordCount = nextWordCount;
        }
      }
    }
    
    // Add the last chunk if not already added
    if (current && (optimized.length === 0 || optimized[optimized.length - 1] !== current)) {
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