import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, BarChart3, Brain, Target, Activity } from 'lucide-react';

interface SpeechAnalysis {
  fluency_score: number;
  clarity_score: number;
  pace_rating: string;
  emotional_indicators: {
    stress: number;
    confidence: number;
    engagement: number;
  };
  speech_patterns: {
    stuttering_detected: boolean;
    repetitions: number;
    pause_frequency: number;
    word_retrieval_difficulty: boolean;
  };
  recommendations: string[];
}

const SpeechPatternAnalysis: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for real-time analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const audioChunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        // const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        analyzeAudio();
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio level monitoring
      monitorAudioLevel();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setAudioLevel(0);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  };

  const analyzeAudio = async () => {
    // Simulate audio analysis (in real implementation, this would send to backend)
    setTimeout(() => {
      const mockAnalysis: SpeechAnalysis = {
        fluency_score: 0.7 + Math.random() * 0.3,
        clarity_score: 0.6 + Math.random() * 0.4,
        pace_rating: ['slow', 'normal', 'fast'][Math.floor(Math.random() * 3)],
        emotional_indicators: {
          stress: Math.random() * 0.5,
          confidence: 0.5 + Math.random() * 0.5,
          engagement: 0.4 + Math.random() * 0.6
        },
        speech_patterns: {
          stuttering_detected: Math.random() < 0.3,
          repetitions: Math.floor(Math.random() * 5),
          pause_frequency: Math.random() * 0.8,
          word_retrieval_difficulty: Math.random() < 0.4
        },
        recommendations: generateSpeechRecommendations()
      };
      
      setAnalysis(mockAnalysis);
      setTranscript("Sample transcript: Hello, this is a test of the speech analysis system. I am speaking clearly and at a normal pace.");
    }, 2000);
  };

  const generateSpeechRecommendations = (): string[] => {
    const allRecommendations = [
      "Practice breathing exercises before speaking",
      "Slow down speech pace for better clarity",
      "Use visual cues to support communication",
      "Practice tongue twisters for articulation",
      "Record yourself daily to track progress",
      "Use pacing strategies during conversation",
      "Practice word retrieval exercises",
      "Try rhythmic speech patterns",
      "Use gestures to support communication",
      "Practice reading aloud daily"
    ];
    
    return allRecommendations.slice(0, 3 + Math.floor(Math.random() * 3));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPaceColor = (pace: string) => {
    const colors = {
      slow: 'text-blue-600',
      normal: 'text-green-600',
      fast: 'text-yellow-600'
    };
    return colors[pace as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Volume2 className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Speech Pattern Analysis</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced AI analysis for speech therapy and communication support
          </p>
        </motion.div>

        {/* Recording Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
        >
          <div className="text-center">
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </motion.button>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-800">
                {isRecording ? 'Recording...' : 'Ready to Record'}
              </div>
              
              {isRecording && (
                <div className="text-lg text-gray-600">
                  {formatTime(recordingTime)}
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                {isRecording ? 'Click to stop recording' : 'Click to start speech analysis'}
              </div>
            </div>

            {/* Audio Level Indicator */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6"
              >
                <div className="text-sm text-gray-600 mb-2">Audio Level</div>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-200"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800 mb-1">Fluency</div>
                    <div className={`text-3xl font-bold ${getScoreColor(analysis.fluency_score)}`}>
                      {(analysis.fluency_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800 mb-1">Clarity</div>
                    <div className={`text-3xl font-bold ${getScoreColor(analysis.clarity_score)}`}>
                      {(analysis.clarity_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800 mb-1">Pace</div>
                    <div className={`text-2xl font-bold capitalize ${getPaceColor(analysis.pace_rating)}`}>
                      {analysis.pace_rating}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emotional Indicators */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-500" />
                    Emotional Indicators
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(analysis.emotional_indicators).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="capitalize font-medium">{key.replace('_', ' ')}</span>
                          <span className={`font-bold ${getScoreColor(value)}`}>
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Speech Patterns */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                    Speech Patterns
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Stuttering Detected</span>
                      <span className={`font-bold ${analysis.speech_patterns.stuttering_detected ? 'text-red-600' : 'text-green-600'}`}>
                        {analysis.speech_patterns.stuttering_detected ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Repetitions</span>
                      <span className="font-bold text-gray-700">
                        {analysis.speech_patterns.repetitions}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Pause Frequency</span>
                      <span className="font-bold text-gray-700">
                        {(analysis.speech_patterns.pause_frequency * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Word Retrieval Difficulty</span>
                      <span className={`font-bold ${analysis.speech_patterns.word_retrieval_difficulty ? 'text-yellow-600' : 'text-green-600'}`}>
                        {analysis.speech_patterns.word_retrieval_difficulty ? 'Detected' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Transcript</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed">
                    {transcript}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Personalized Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{recommendation}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpeechPatternAnalysis;
