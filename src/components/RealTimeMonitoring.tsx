import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Brain, Heart, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface EmotionData {
  emotion: string;
  confidence: number;
  all_emotions: { [key: string]: number };
}

interface EngagementData {
  engagement_score: number;
  stress_level: number;
  recommendations: string[];
}

interface CognitiveLoadData {
  cognitive_load: number;
  metrics: {
    response_time: number[];
    error_rate: number;
    help_requests: number;
  };
}

const RealTimeMonitoring: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [cognitiveData, setCognitiveData] = useState<CognitiveLoadData | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {Q
    checkPermissions();
    return () => {
      stopMonitoring();
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      setCameraPermission(cameraResult.state === 'granted');
      setMicPermission(micResult.state === 'granted');
    } catch {
      console.log('Permission check not supported, will request during start');
    }
  };

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsMonitoring(true);
      setCameraPermission(true);
      setMicPermission(true);

      // Start analysis loop
      startAnalysisLoop();
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      setCameraPermission(false);
      setMicPermission(false);
    }
  };

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsMonitoring(false);
  };

  const startAnalysisLoop = () => {
    // Simulate real-time analysis data
    const interval = setInterval(() => {
      if (!isMonitoring) {
        clearInterval(interval);
        return;
      }

      // Mock emotion data
      const emotions = ['happy', 'neutral', 'focused', 'confused', 'frustrated'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      setEmotionData({
        emotion: randomEmotion,
        confidence: 0.7 + Math.random() * 0.3,
        all_emotions: {
          happy: Math.random() * 0.3,
          neutral: Math.random() * 0.4,
          focused: Math.random() * 0.4,
          confused: Math.random() * 0.2,
          frustrated: Math.random() * 0.2
        }
      });

      // Mock engagement data
      const engagementScore = 0.3 + Math.random() * 0.7;
      const stressLevel = Math.random() * 0.6;
      
      setEngagementData({
        engagement_score: engagementScore,
        stress_level: stressLevel,
        recommendations: generateRecommendations(engagementScore, stressLevel)
      });

      // Mock cognitive load data
      setCognitiveData({
        cognitive_load: Math.random() * 0.8,
        metrics: {
          response_time: [2 + Math.random() * 3],
          error_rate: Math.floor(Math.random() * 5),
          help_requests: Math.floor(Math.random() * 3)
        }
      });
    }, 2000);
  };

  const generateRecommendations = (engagement: number, stress: number): string[] => {
    const recommendations: string[] = [];
    
    if (stress > 0.7) {
      recommendations.push("Take a calming break");
      recommendations.push("Try deep breathing exercises");
    }
    
    if (engagement < 0.4) {
      recommendations.push("Switch to interactive activity");
      recommendations.push("Add visual elements");
    }
    
    if (engagement > 0.8 && stress < 0.3) {
      recommendations.push("Excellent focus! Continue current activity");
    }
    
    return recommendations;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      happy: 'text-green-600',
      neutral: 'text-gray-600',
      focused: 'text-blue-600',
      confused: 'text-yellow-600',
      frustrated: 'text-red-600',
      sad: 'text-blue-500',
      angry: 'text-red-600'
    };
    return colors[emotion] || 'text-gray-600';
  };

  const getEngagementColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStressColor = (level: number) => {
    if (level >= 0.7) return 'text-red-600';
    if (level >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Real-Time Monitoring</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered monitoring for optimal learning experiences
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-gray-600" />
                <span className={`text-sm ${cameraPermission ? 'text-green-600' : 'text-red-600'}`}>
                  Camera: {cameraPermission ? 'Ready' : 'Permission needed'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-gray-600" />
                <span className={`text-sm ${micPermission ? 'text-green-600' : 'text-red-600'}`}>
                  Microphone: {micPermission ? 'Ready' : 'Permission needed'}
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isMonitoring
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </motion.button>
          </div>
        </motion.div>

        {/* Video Feed */}
        {isMonitoring && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Live Feed</h3>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Status Overlay */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                🔴 LIVE
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Results */}
        <AnimatePresence>
          {isMonitoring && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Emotion Analysis */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Emotion Analysis
                </h3>
                
                {emotionData && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getEmotionColor(emotionData.emotion)}`}>
                        {emotionData.emotion.charAt(0).toUpperCase() + emotionData.emotion.slice(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Confidence: {(emotionData.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(emotionData.all_emotions).map(([emotion, value]) => (
                        <div key={emotion} className="flex justify-between items-center">
                          <span className="capitalize text-sm">{emotion}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${value * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-8">
                              {(value * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement & Stress */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Engagement & Stress
                </h3>
                
                {engagementData && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Engagement</span>
                        <span className={`font-bold ${getEngagementColor(engagementData.engagement_score)}`}>
                          {(engagementData.engagement_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${engagementData.engagement_score * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Stress Level</span>
                        <span className={`font-bold ${getStressColor(engagementData.stress_level)}`}>
                          {(engagementData.stress_level * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-red-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${engagementData.stress_level * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cognitive Load */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Cognitive Load
                </h3>
                
                {cognitiveData && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {(cognitiveData.cognitive_load * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Processing Load</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="font-medium">
                          {cognitiveData.metrics.response_time[0]?.toFixed(1) || 0}s
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Error Rate</span>
                        <span className="font-medium">{cognitiveData.metrics.error_rate}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Help Requests</span>
                        <span className="font-medium">{cognitiveData.metrics.help_requests}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations */}
        <AnimatePresence>
          {isMonitoring && engagementData?.recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Real-Time Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engagementData.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded"
                  >
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
