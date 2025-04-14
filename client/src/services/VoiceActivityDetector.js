export class VoiceActivityDetector {
    constructor(options = {}) {
        // Configuration parameters
        this.sampleRate = options.sampleRate || 16000;
        this.frameSize = options.frameSize || 512;
        this.smoothingTimeConstant = options.smoothingTimeConstant || 0.95;
        this.energyThreshold = options.energyThreshold || 0.01;
        this.minSilenceDuration = options.minSilenceDuration || 0.5; // seconds
        this.minSpeechDuration = options.minSpeechDuration || 0.25; // seconds
        this.absoluteSilenceThreshold = options.absoluteSilenceThreshold || 0.001; // Threshold for complete silence
        this.noiseFloor = -Infinity; // Dynamic noise floor
        this.noiseFloorAlpha = 0.95; // Noise floor adaptation rate
        
        // State variables
        this.isSpeaking = false;
        this.smoothedEnergy = 0;
        this.silenceStartTime = 0;
        this.speechStartTime = 0;
        this.consecutiveSilenceFrames = 0;
        this.maxSilenceFrames = Math.ceil(this.sampleRate * 0.5 / this.frameSize); // 0.5 seconds worth of frames
        
        // Callbacks
        this.onSpeechStart = options.onSpeechStart || (() => {});
        this.onSpeechEnd = options.onSpeechEnd || (() => {});
    }
    
    calculateRMSEnergy(audioData) {
        let sum = 0;
        let hasNonZero = false;
        
        for (let i = 0; i < audioData.length; i++) {
            const sample = audioData[i];
            sum += sample * sample;
            if (sample !== 0) hasNonZero = true;
        }
        
        // If all samples are zero, return 0 immediately
        if (!hasNonZero) {
            this.consecutiveSilenceFrames++;
            return 0;
        }
        
        this.consecutiveSilenceFrames = 0;
        return Math.sqrt(sum / audioData.length);
    }
    
    updateNoiseFloor(energy) {
        if (energy > 0 && energy < this.energyThreshold) {
            if (this.noiseFloor === -Infinity) {
                this.noiseFloor = energy;
            } else {
                this.noiseFloor = this.noiseFloorAlpha * this.noiseFloor + 
                    (1 - this.noiseFloorAlpha) * energy;
            }
        }
    }
    
    processAudio(audioData) {
        // Calculate current frame energy
        const currentEnergy = this.calculateRMSEnergy(audioData);
        
        // Check for absolute silence
        if (currentEnergy === 0 && this.consecutiveSilenceFrames > this.maxSilenceFrames) {
            if (this.isSpeaking) {
                this.isSpeaking = false;
                this.onSpeechEnd();
            }
            this.smoothedEnergy = 0;
            this.silenceStartTime = 0;
            this.speechStartTime = 0;
            return false;
        }
        
        // Update noise floor
        this.updateNoiseFloor(currentEnergy);
        
        // Apply exponential smoothing
        this.smoothedEnergy = this.smoothingTimeConstant * this.smoothedEnergy + 
            (1 - this.smoothingTimeConstant) * currentEnergy;
        
        const now = Date.now() / 1000; // Convert to seconds
        
        // Adjust threshold based on noise floor
        const effectiveThreshold = Math.max(this.energyThreshold, this.noiseFloor * 2);
        
        if (this.isSpeaking) {
            if (this.smoothedEnergy < effectiveThreshold) {
                // Potential end of speech
                if (this.silenceStartTime === 0) {
                    this.silenceStartTime = now;
                } else if (now - this.silenceStartTime >= this.minSilenceDuration) {
                    // Confirmed end of speech
                    this.isSpeaking = false;
                    this.silenceStartTime = 0;
                    this.onSpeechEnd();
                }
            } else {
                // Reset silence timer if we detect energy
                this.silenceStartTime = 0;
            }
        } else {
            if (this.smoothedEnergy >= effectiveThreshold) {
                // Potential start of speech
                if (this.speechStartTime === 0) {
                    this.speechStartTime = now;
                } else if (now - this.speechStartTime >= this.minSpeechDuration) {
                    // Confirmed start of speech
                    this.isSpeaking = true;
                    this.speechStartTime = 0;
                    this.onSpeechStart();
                }
            } else {
                // Reset speech timer if energy drops
                this.speechStartTime = 0;
            }
        }
        
        return this.isSpeaking;
    }
    
    reset() {
        this.isSpeaking = false;
        this.smoothedEnergy = 0;
        this.silenceStartTime = 0;
        this.speechStartTime = 0;
        this.noiseFloor = -Infinity;
        this.consecutiveSilenceFrames = 0;
    }
    
    setThreshold(threshold) {
        this.energyThreshold = threshold;
    }
    
    setSmoothingTimeConstant(constant) {
        this.smoothingTimeConstant = Math.max(0, Math.min(1, constant));
    }
    
    getEnergy() {
        return this.smoothedEnergy;
    }
    
    getState() {
        return this.isSpeaking;
    }
} 