class Linear16Processor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.bufferSize = 2048; // Process in chunks of 2048 samples
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.sampleRate = options.processorOptions?.sampleRate || 16000;
    
    // Verify sample rate matches Deepgram requirements
    if (this.sampleRate !== 16000) {
      console.error('Sample rate must be 16kHz for Deepgram compatibility');
    }
    
    console.log('Linear16Processor initialized with sample rate:', this.sampleRate);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) {
      console.log('No input received');
      return true;
    }

    const inputChannel = input[0];
    
    // Fill our buffer
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex++] = inputChannel[i];
      
      // When buffer is full, convert and send
      if (this.bufferIndex >= this.bufferSize) {
        // Convert Float32Array to Int16Array with proper scaling
        const int16Data = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          // Properly scale and clamp float32 to int16 range
          const sample = Math.max(-1, Math.min(1, this.buffer[j]));
          // Convert to 16-bit PCM
          int16Data[j] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }
        
        try {
          // Send the buffer to the main thread
          this.port.postMessage({
            type: 'audio',
            data: int16Data.buffer,
            sampleRate: this.sampleRate,
            timestamp: currentTime,
            format: {
              encoding: 'LINEAR16',
              sampleRateHertz: this.sampleRate,
              channelCount: 1,
              bitsPerSample: 16
            }
          }, [int16Data.buffer]);
        } catch (error) {
          console.error('Error sending audio data:', error);
        }
        
        // Reset buffer index
        this.bufferIndex = 0;
        // Create new buffer since we transferred the old one
        this.buffer = new Float32Array(this.bufferSize);
      }
    }
    
    return true;
  }
}

registerProcessor('linear16-processor', Linear16Processor); 