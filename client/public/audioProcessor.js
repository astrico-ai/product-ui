class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        const { sampleRate, chunkSize } = options.processorOptions;
        
        this.sampleRate = sampleRate;
        this.chunkSize = chunkSize;
        this.buffer = new Float32Array(0);
        this.lastProcessedTime = 0;
        this.processingInterval = 1000 / (sampleRate / chunkSize); // Time between chunks in ms
    }

    convertToMono(inputs) {
        const input = inputs[0];
        if (!input || !input[0]) return null;

        const channels = input.length;
        const samples = input[0].length;
        const monoData = new Float32Array(samples);

        // Mix all channels to mono
        for (let sample = 0; sample < samples; sample++) {
            let sum = 0;
            for (let channel = 0; channel < channels; channel++) {
                sum += input[channel][sample];
            }
            monoData[sample] = sum / channels;
        }

        return monoData;
    }

    resampleAudio(audioData, fromRate, toRate) {
        if (fromRate === toRate) return audioData;

        const ratio = fromRate / toRate;
        const newLength = Math.round(audioData.length / ratio);
        const result = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            const position = i * ratio;
            const index = Math.floor(position);
            const fraction = position - index;

            // Linear interpolation
            if (index + 1 < audioData.length) {
                result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
            } else {
                result[i] = audioData[index];
            }
        }

        return result;
    }

    processResampledData(resampledData) {
        // Concatenate with existing buffer
        const newBuffer = new Float32Array(this.buffer.length + resampledData.length);
        newBuffer.set(this.buffer);
        newBuffer.set(resampledData, this.buffer.length);
        this.buffer = newBuffer;

        // Extract complete chunks
        const chunks = [];
        while (this.buffer.length >= this.chunkSize) {
            // Convert to 16-bit PCM
            const chunk = new Int16Array(this.chunkSize);
            for (let i = 0; i < this.chunkSize; i++) {
                // Clamp values between -1 and 1, then convert to 16-bit PCM
                const sample = Math.max(-1, Math.min(1, this.buffer[i]));
                chunk[i] = Math.round(sample * 32767);
            }
            chunks.push(chunk);

            // Remove processed samples from buffer
            this.buffer = this.buffer.slice(this.chunkSize);
        }

        return chunks;
    }

    process(inputs, outputs) {
        // Check timing to maintain consistent chunk rate
        const currentTime = currentTime;
        if (currentTime - this.lastProcessedTime < this.processingInterval) {
            return true;
        }
        this.lastProcessedTime = currentTime;

        // Convert input to mono
        const monoData = this.convertToMono(inputs);
        if (!monoData) return true;

        // Resample to target rate if needed
        const resampledData = this.resampleAudio(monoData, sampleRate, this.sampleRate);

        // Process into chunks
        const chunks = this.processResampledData(resampledData);

        // Send chunks to main thread
        chunks.forEach(chunk => {
            this.port.postMessage(chunk);
        });

        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor); 