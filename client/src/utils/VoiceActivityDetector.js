import { createSpeechConfig } from '@microsoft/cognitiveservices-speech-sdk';

export class VoiceActivityDetector {
    constructor(options = {}) {
        this.options = {
            sampleRate: options.sampleRate || 16000,
            frameDuration: options.frameDuration || 30, // ms
            smoothingTimeConstant: options.smoothingTimeConstant || 0.99,
            energyThreshold: options.energyThreshold || -50, // dB
            minSpeechDuration: options.minSpeechDuration || 250, // ms
            minSilenceDuration: options.minSilenceDuration || 500, // ms
            preSpeechPadding: options.preSpeechPadding || 500, // ms
            postSpeechPadding: options.postSpeechPadding || 1000, // ms
        };

        this.frameSize = Math.floor(this.options.sampleRate * this.options.frameDuration / 1000);
        this.buffer = new Float32Array(0);
        this.isSpeaking = false;
        this.lastSpeechTimestamp = 0;
        this.lastSilenceTimestamp = 0;
        this.averageEnergy = -100;
        this.onSpeechStart = null;
        this.onSpeechEnd = null;
    }

    calculateRMS(frame) {
        let sum = 0;
        for (let i = 0; i < frame.length; i++) {
            sum += frame[i] * frame[i];
        }
        const rms = Math.sqrt(sum / frame.length);
        return 20 * Math.log10(rms); // Convert to dB
    }

    processAudioData(audioData) {
        // Append new audio data to buffer
        const newBuffer = new Float32Array(this.buffer.length + audioData.length);
        newBuffer.set(this.buffer);
        newBuffer.set(audioData, this.buffer.length);
        this.buffer = newBuffer;

        // Process complete frames
        while (this.buffer.length >= this.frameSize) {
            const frame = this.buffer.slice(0, this.frameSize);
            this.processFrame(frame);
            this.buffer = this.buffer.slice(this.frameSize);
        }
    }

    processFrame(frame) {
        const currentTime = performance.now();
        const energy = this.calculateRMS(frame);

        // Update average energy using exponential smoothing
        this.averageEnergy = this.options.smoothingTimeConstant * this.averageEnergy +
            (1 - this.options.smoothingTimeConstant) * energy;

        const isSpeechFrame = energy > this.options.energyThreshold;

        if (!this.isSpeaking) {
            if (isSpeechFrame) {
                const silenceDuration = currentTime - this.lastSpeechTimestamp;
                if (silenceDuration >= this.options.minSilenceDuration) {
                    this.isSpeaking = true;
                    this.lastSpeechTimestamp = currentTime;
                    if (this.onSpeechStart) {
                        this.onSpeechStart({
                            timestamp: currentTime - this.options.preSpeechPadding,
                            energy: energy
                        });
                    }
                }
            }
        } else {
            if (!isSpeechFrame) {
                const speechDuration = currentTime - this.lastSilenceTimestamp;
                if (speechDuration >= this.options.minSpeechDuration) {
                    this.isSpeaking = false;
                    this.lastSilenceTimestamp = currentTime;
                    if (this.onSpeechEnd) {
                        this.onSpeechEnd({
                            timestamp: currentTime + this.options.postSpeechPadding,
                            energy: energy
                        });
                    }
                }
            } else {
                this.lastSpeechTimestamp = currentTime;
            }
        }
    }

    reset() {
        this.buffer = new Float32Array(0);
        this.isSpeaking = false;
        this.lastSpeechTimestamp = 0;
        this.lastSilenceTimestamp = 0;
        this.averageEnergy = -100;
    }
}

export default VoiceActivityDetector; 