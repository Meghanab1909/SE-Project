import { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AudioRecorder({ donationId, userId, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (error) {
      toast.error('Microphone access denied');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        await axios.post(`${API}/audio-message`, {
          user_id: userId,
          donation_id: donationId,
          audio_data: base64Audio,
          duration
        });

        toast.success('Voice message saved! 🎤');
        onClose();
      };
    } catch (error) {
      toast.error('Failed to save audio');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass rounded-3xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Record Your Message
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-all"
            data-testid="close-audio-recorder-btn"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Recording Status */}
          <div className="text-center">
            {isRecording && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Recording...</span>
              </div>
            )}
            
            <div className="text-4xl font-bold text-white mt-4">
              {formatTime(duration)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-full p-6"
                data-testid="start-recording-btn"
              >
                <Mic size={32} />
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-full p-6"
                data-testid="stop-recording-btn"
              >
                <Square size={32} />
              </Button>
            )}

            {audioBlob && (
              <>
                <Button
                  onClick={playAudio}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-full p-6"
                  data-testid="play-audio-btn"
                >
                  <Play size={32} />
                </Button>
                
                <Button
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioURL(null);
                    setDuration(0);
                  }}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  data-testid="reset-audio-btn"
                >
                  Record Again
                </Button>
              </>
            )}
          </div>

          {/* Upload Button */}
          {audioBlob && (
            <Button
              onClick={uploadAudio}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl"
              data-testid="upload-audio-btn"
            >
              {isUploading ? 'Saving...' : 'Save Voice Message 🎤'}
            </Button>
          )}

          <p className="text-gray-400 text-sm text-center">
            Share why this donation matters to you (max 2 minutes)
          </p>
        </div>
      </div>
    </div>
  );
}
