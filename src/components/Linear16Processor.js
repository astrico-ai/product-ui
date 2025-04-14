class Linear16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048; // Process in chunks of 2048 samples
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    
    // Fill our buffer
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex++] = inputChannel[i];
      
      // When buffer is full, convert and send
      if (this.bufferIndex >= this.bufferSize) {
        // Convert Float32Array to Int16Array
        const int16Data = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          const s = Math.max(-1, Math.min(1, this.buffer[j]));
          int16Data[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send the buffer to the main thread
        this.port.postMessage({
          type: 'audio',
          data: int16Data.buffer
        }, [int16Data.buffer]); // Transfer the buffer for better performance
        
        // Reset buffer index
        this.bufferIndex = 0;
      }
    }
    
    return true;
  }
}

registerProcessor('linear16-processor', Linear16Processor); 