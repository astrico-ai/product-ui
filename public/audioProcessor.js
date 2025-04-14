class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        
        // Get processor options
        const processorOptions = options.processorOptions || {};
        
        // Initialize properties
        this.sampleRate = processorOptions.sampleRate || 16000;
        this.chunkSize = processorOptions.chunkSize || 1024;
        this.buffer = new Float32Array(this.chunkSize);
        this.bufferIndex = 0;
        this.silenceThreshold = processorOptions.silenceThreshold || 0.001;
        this.consecutiveSilentChunks = 0;
        this.maxSilentChunks = 5; // After this many silent chunks, reduce processing
        this.processingInterval = processorOptions.processingInterval || 1; // Process every Nth chunk during silence
        this.processCount = 0;
    }

    detectSilence(inputChannel) {
        let maxAbs = 0;
        for (let i = 0; i < inputChannel.length; i++) {
            const absValue = Math.abs(inputChannel[i]);
            if (absValue > maxAbs) maxAbs = absValue;
        }
        return maxAbs < this.silenceThreshold;
    }

    process(inputs, outputs, parameters) {
        // Get input data (assuming mono audio)
        const input = inputs[0];
        if (!input || !input.length) return true;
        
        const inputChannel = input[0];
        
        // Check for silence
        const isSilent = this.detectSilence(inputChannel);
        
        if (isSilent) {
            this.consecutiveSilentChunks++;
        } else {
            this.consecutiveSilentChunks = 0;
        }
        
        // During extended silence, process only every Nth chunk
        if (this.consecutiveSilentChunks > this.maxSilentChunks) {
            this.processCount++;
            if (this.processCount % this.processingInterval !== 0) {
                return true;
            }
        }
        
        // Process each sample
        for (let i = 0; i < inputChannel.length; i++) {
            // Add sample to buffer
            this.buffer[this.bufferIndex++] = inputChannel[i];
            
            // If buffer is full, send it and reset
            if (this.bufferIndex >= this.chunkSize) {
                // Only send if not completely silent or if it's a processing interval
                if (!isSilent || this.processCount % this.processingInterval === 0) {
                    this.port.postMessage({
                        type: 'audio',
                        audioData: this.buffer.slice(),
                        isSilent: isSilent
                    });
                }
                
                this.bufferIndex = 0;
            }
        }
        
        // Continue processing
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor); 