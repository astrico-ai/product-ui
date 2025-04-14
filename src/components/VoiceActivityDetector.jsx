import React, { useEffect, useRef, useState } from 'react';

export function VoiceActivityDetector({ onSpeechStart, onSpeechEnd, onDataAvailable, enabled = true }) {
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Initialize audio processing
  const initializeAudioProcessing = async () => {
    try {
      console.log('Initializing audio processing...');
      
      // Get audio stream with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Got audio stream');
      streamRef.current = stream;
      
      // Create AudioContext with specific sample rate
      const audioContext = new AudioContext({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });
      audioContextRef.current = audioContext;
      
      // Load and register the audio worklet
      await audioContext.audioWorklet.addModule('/Linear16Processor.js');
      console.log('Audio worklet loaded');
      
      // Create audio processing pipeline
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'linear16-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
        processorOptions: {
          sampleRate: 16000
        }
      });
      
      // Handle audio data from worklet
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio') {
          console.log('Received audio chunk:', event.data.data.byteLength, 'bytes');
          if (enabled) {
            onDataAvailable(event.data.data);
          }
        }
      };
      
      // Connect the audio nodes
      source.connect(workletNode);
      // Don't connect to destination to avoid echo
      // workletNode.connect(audioContext.destination);
      
      workletNodeRef.current = workletNode;
      
      console.log('Audio processing initialized');
      return true;
    } catch (err) {
      console.error('Error initializing audio:', err);
      setError(err);
      return false;
    }
  };

  // Initialize audio when component mounts or enabled changes
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Starting audio initialization...');
        setIsLoading(true);
        setError(null);

        const success = await initializeAudioProcessing();
        if (mounted) {
          setIsLoading(!success);
          if (success) {
            console.log('Audio initialization successful, ready to process');
          }
        }
      } catch (err) {
        console.error('Audio initialization error:', err);
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      // Cleanup
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect();
        workletNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsSpeaking(false);
    };
  }, [enabled]);

  // Update speaking state based on enabled prop
  useEffect(() => {
    console.log('Speaking state changed:', enabled);
    setIsSpeaking(enabled);
    if (enabled) {
      // Resume AudioContext if it was suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      onSpeechStart?.();
    } else {
      onSpeechEnd?.();
    }
  }, [enabled, onSpeechStart, onSpeechEnd]);

  return (
    <div style={{ display: 'none' }}>
      {isLoading && <div>Loading voice detection...</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
} 