import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, AlertCircle, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TypewriterText } from "@/components/TypewriterText";
import io from 'socket.io-client';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import { VoiceActivityDetector } from './VoiceActivityDetector';

export function TrainingScenario({ isOpen, onClose, scenario }) {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const conversationEndRef = useRef(null);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);
  const timerRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  // Reset all states when component mounts or isOpen changes
  useEffect(() => {
    if (isOpen) {
      console.log('Initializing scenario...');
      setIsTrainingStarted(false);
      setConversation([]);
      setElapsedTime(0);
      setIsProcessing(false);
      setIsRecording(false);
    }
  }, [isOpen]);

  // Debug logging for training state changes
  useEffect(() => {
    console.log('Training state changed:', isTrainingStarted);
  }, [isTrainingStarted]);

  // Debug logging for component mount and props
  useEffect(() => {
    console.log('Scenario opened:', isOpen);
  }, [isOpen]);

  // Initialize socket connection
  useEffect(() => {
    if (isOpen) {
      socketRef.current = io('http://localhost:3000');
      
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('processing_status', (data) => {
        console.log('Processing status:', data);
      });

      socketRef.current.on('training_instructions', (response) => {
        console.log('Received training instructions:', response);
        try {
          // Add instructions to conversation
          setConversation(prev => [...prev, {
            type: 'ai',
            text: response.text,
            isInstructions: true
          }]);

          // Play the instructions audio
          if (response.audio) {
            // Convert the binary data to an array buffer
            const audioArrayBuffer = new Uint8Array(response.audio.data || response.audio).buffer;
            const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.oncanplay = () => {
              console.log('Audio can play');
              audio.play().catch(error => {
                console.error('Error playing instructions audio:', error);
              });
            };

            audio.onerror = (error) => {
              console.error('Audio loading error:', error);
            };
          } else {
            console.error('No audio data received');
          }
        } catch (error) {
          console.error('Error handling training instructions:', error);
        }
      });

      socketRef.current.on('ai_response', (response) => {
        try {
          setConversation(prev => {
            const newConversation = [...prev];
            
            // If this is not the initial greeting and we have a transcription
            if (!response.isInitial && response.transcription) {
              // Update the last user message with transcription
              for (let i = newConversation.length - 1; i >= 0; i--) {
                if (newConversation[i].type === 'user') {
                  newConversation[i].text = response.transcription;
                  break;
                }
              }
            }

            // Add AI response
            newConversation.push({
              type: 'ai',
              text: response.text,
              isInitial: response.isInitial
            });

            return newConversation;
          });

          setIsProcessing(false);

          // Play the audio response
          if (response.audio) {
            // Convert the binary data to an array buffer
            const audioArrayBuffer = new Uint8Array(response.audio.data || response.audio).buffer;
            const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.oncanplay = () => {
              console.log('Audio can play');
              audio.play().catch(error => {
                console.error('Error playing response audio:', error);
              });
            };

            audio.onerror = (error) => {
              console.error('Audio loading error:', error);
            };
          }
        } catch (error) {
          console.error('Error handling AI response:', error);
        }
      });

      socketRef.current.on('error', (error) => {
        console.error('Server error:', error);
        setIsProcessing(false);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isOpen]);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Timer for elapsed time
  useEffect(() => {
    let interval;
    if (isOpen) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle speech detection events
  const handleSpeechStart = () => {
    if (!isProcessing && isTrainingStarted) {
      console.log('Speech detected, starting to process...');
      setIsRecording(true);
    }
  };

  const handleSpeechEnd = () => {
    if (isRecording) {
      console.log('Speech ended, stopping recording...');
      setIsRecording(false);
    }
  };

  const handleAudioData = async (audioBuffer) => {
    if (!isProcessing && isTrainingStarted) {
      try {
        console.log('Handling audio data, size:', audioBuffer.byteLength, 'bytes');
        setIsProcessing(true);
        
        // Convert Int16Array to base64 properly
        const audioData = new Int16Array(audioBuffer);
        const base64Audio = btoa(
          String.fromCharCode.apply(null, new Uint8Array(audioData.buffer))
        );
        
        console.log('Converted to base64, length:', base64Audio.length);
        
        // Add user message to conversation with a temporary processing state
        setConversation(prev => [...prev, {
          type: 'user',
          text: 'Processing...',
          status: 'processing'
        }]);
        
        console.log('Sending audio data to server...');
        // Send audio to server
        socketRef.current.emit('audio_data', {
          audio: base64Audio,
          mimeType: 'audio/l16'
        });
      } catch (error) {
        console.error('Error processing audio data:', error);
        setIsProcessing(false);
      }
    } else {
      console.log('Skipping audio processing:', 
        isProcessing ? 'already processing' : 'training not started');
    }
  };

  // Replace the startRecording and stopRecording functions with VAD toggle
  const toggleListening = () => {
    setIsListening(!isListening);
  };

  useEffect(() => {
    if (isOpen) {
      requestPermissions();
    }
    return () => {
      cleanupStreams();
    };
  }, [isOpen]);

  useEffect(() => {
    let videoElement = videoRef.current;
    if (videoElement && streamRef.current) {
      videoElement.srcObject = streamRef.current;
      videoElement.onloadedmetadata = () => {
        videoElement.play().catch(e => console.error('Error playing video:', e));
      };
    }
  }, [hasPermissions]);

  const cleanupStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleClose = () => {
    console.log('Handling close...');
    cleanupStreams();
    socketRef.current?.emit('end_training');
    setIsTrainingStarted(false);
    setConversation([]);
    setElapsedTime(0);
    setIsProcessing(false);
    setIsRecording(false);
    onClose();
  };

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);
      setShowPermissionModal(false);
    } catch (error) {
      console.error('Permission error:', error);
      setShowPermissionModal(true);
    }
  };

  const openBrowserSettings = () => {
    // This will trigger the browser's permission prompt again
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        // If successful, cleanup the temporary stream and request permissions again
        stream.getTracks().forEach(track => track.stop());
        requestPermissions();
      })
      .catch(error => {
        console.error('Permission error:', error);
        // If Chrome
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          window.open('chrome://settings/content/camera');
        }
        // If Firefox
        else if (navigator.userAgent.indexOf('Firefox') !== -1) {
          window.open('about:preferences#privacy');
        }
        // For other browsers, show the error
        else {
          console.error('Please enable camera and microphone permissions in your browser settings');
        }
      });
  };

  const toggleMicrophone = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const toggleCamera = async () => {
    if (streamRef.current) {
      if (isCameraOn) {
        // If turning camera off, stop video tracks
        streamRef.current.getVideoTracks().forEach(track => {
          track.stop();
        });
      } else {
        try {
          // Request a new stream for video only
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            }
          });
          
          // Stop any existing video tracks
          streamRef.current.getVideoTracks().forEach(track => track.stop());
          
          // Get the new video track
          const newVideoTrack = newStream.getVideoTracks()[0];
          
          // Get the existing audio track
          const audioTrack = streamRef.current.getAudioTracks()[0];
          
          // Create a new MediaStream with both tracks
          const combinedStream = new MediaStream();
          if (audioTrack) combinedStream.addTrack(audioTrack);
          if (newVideoTrack) combinedStream.addTrack(newVideoTrack);
          
          // Update the stream reference
          streamRef.current = combinedStream;
          
          // Update video element
          if (videoRef.current) {
            videoRef.current.srcObject = combinedStream;
          }
        } catch (error) {
          console.error('Error restarting camera:', error);
          return; // Don't update isCameraOn if we failed to start the camera
        }
      }
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = isAudioOn;
      setIsAudioOn(!isAudioOn);
    }
  };

  const handleTrainingToggle = () => {
    console.log('Training toggle clicked. Current state:', isTrainingStarted);
    if (!isTrainingStarted) {
      console.log('Starting training...');
      setIsTrainingStarted(true);
      setConversation([]);
      setElapsedTime(0);
      socketRef.current?.emit('start_training');
    } else {
      console.log('Ending training...');
      socketRef.current?.emit('end_training');
      handleClose();
    }
  };

  if (!isOpen) return null;

  // Permission Denied Modal
  if (showPermissionModal) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Permission Required</h3>
            <p className="text-gray-600 mb-6">
              This training scenario requires access to your camera and microphone. Please allow access in your browser settings to proceed.
            </p>
            <div className="space-y-4 w-full">
              <Button 
                className="w-full bg-[#3551F3]"
                onClick={openBrowserSettings}
              >
                Enable Permissions
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Cancel Training
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-[1800px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">{scenario?.title}</h2>
            <p className="text-gray-400">Practice your customer service skills</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-220px)]">
          {/* AI Avatar Side */}
          <div className="relative rounded-2xl bg-gray-900 overflow-hidden border border-gray-800 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20" />
            
            {/* AI Avatar */}
            <div className="p-6 flex items-center gap-4 border-b border-gray-800 relative z-10">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/ai-avatar.svg" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-white">AI Customer</h3>
                <p className="text-sm text-gray-400">Hindi-speaking loan default scenario</p>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      msg.type === 'user'
                        ? 'bg-[#3551F3] text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    {msg.status === 'processing' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-100" />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-200" />
                      </div>
                    ) : (
                      <TypewriterText text={msg.text} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          </div>

          {/* User Video Side */}
          <div className="relative rounded-2xl bg-gray-900 overflow-hidden border border-gray-800">
            {hasPermissions ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={true}
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Camera Access Required</h3>
                  <p className="text-gray-400 mb-4">Please allow access to your camera and microphone to begin the training.</p>
                  <Button onClick={requestPermissions}>
                    Enable Camera & Microphone
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between bg-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-white font-mono">
              {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:
              {String(elapsedTime % 60).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${isMicOn ? 'text-white' : 'text-gray-500'} ${
                isListening ? 'bg-red-500 text-white hover:bg-red-600' : ''
              }`}
              onClick={toggleListening}
              disabled={!isMicOn || !isTrainingStarted}
            >
              {isListening ? (
                <span className="w-2 h-2 rounded-full bg-white" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${isCameraOn ? 'text-white' : 'text-gray-500'}`}
              onClick={toggleCamera}
            >
              {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </Button>

            <div className="w-px h-6 bg-gray-700" />

            <Button 
              variant={isTrainingStarted ? "destructive" : "default"}
              onClick={handleTrainingToggle}
              className="px-4"
              size="sm"
            >
              {isTrainingStarted ? "End Training" : "Start Training"}
            </Button>

            {/* Add the VoiceActivityDetector component */}
            <VoiceActivityDetector
              enabled={isListening && isMicOn && isTrainingStarted}
              onSpeechStart={handleSpeechStart}
              onSpeechEnd={handleSpeechEnd}
              onDataAvailable={handleAudioData}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className="text-gray-400 text-sm">
                {isProcessing ? 'Processing...' : 'Connected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}