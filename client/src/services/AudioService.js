import VoiceActivityDetector from '../utils/VoiceActivityDetector';

export class AudioService {
    constructor(options = {}) {
        this.options = {
            sampleRate: options.sampleRate || 16000,
            vadOptions: options.vadOptions || {},
            onSpeechStart: options.onSpeechStart || null,
            onSpeechEnd: options.onSpeechEnd || null,
            onAudioData: options.onAudioData || null,
        };

        this.audioContext = null;
        this.mediaStream = null;
        this.audioWorklet = null;
        this.vad = new VoiceActivityDetector({
            sampleRate: this.options.sampleRate,
            ...this.options.vadOptions
        });

        // Bind callbacks
        this.vad.onSpeechStart = (event) => {
            if (this.options.onSpeechStart) {
                this.options.onSpeechStart(event);
            }
        };

        this.vad.onSpeechEnd = (event) => {
            if (this.options.onSpeechEnd) {
                this.options.onSpeechEnd(event);
            }
        };
    }

    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.options.sampleRate
            });

            // Load audio worklet
            await this.audioContext.audioWorklet.addModule('/audioProcessor.js');

            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Create audio processing pipeline
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.audioWorklet = new AudioWorkletNode(this.audioContext, 'audio-processor', {
                processorOptions: {
                    sampleRate: this.options.sampleRate,
                    chunkSize: 1024
                }
            });

            // Handle audio data from worklet
            this.audioWorklet.port.onmessage = (event) => {
                if (event.data.type === 'audio') {
                    const audioData = event.data.audioData;
                    
                    // Process through VAD
                    this.vad.processAudioData(audioData);

                    // Forward to callback if needed
                    if (this.options.onAudioData) {
                        this.options.onAudioData(audioData);
                    }
                }
            };

            // Connect nodes
            source.connect(this.audioWorklet);
            this.audioWorklet.connect(this.audioContext.destination);

            return true;
        } catch (error) {
            console.error('Failed to initialize AudioService:', error);
            this.cleanup();
            throw error;
        }
    }

    async start() {
        if (!this.audioContext) {
            await this.initialize();
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async stop() {
        if (this.audioContext && this.audioContext.state === 'running') {
            await this.audioContext.suspend();
        }
    }

    cleanup() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.vad) {
            this.vad.reset();
        }

        this.audioWorklet = null;
    }
}

export default AudioService; 