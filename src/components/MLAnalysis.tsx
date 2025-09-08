import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Heart, Users, MessageCircle, Lightbulb, Target, TrendingUp } from 'lucide-react';

interface AnalysisRequest {
  age: number;
  attention_level: number;
  social_interaction: number;
  communication_skills: number;
  behavioral_patterns: string;
  learning_preferences: string[];
}

interface AnalysisResult {
  status: string;
  message: string;
  emotion_prediction: number[];
  attention_score: number;
  adaptive_learning_params: number[];
  routine_support_probabilities: number[];
  recommendations: string[];
  child_profile: {
    age: number;
    attention_level: number;
    social_interaction: number;
    communication_skills: number;
    behavioral_patterns: string;
    learning_preferences: string[];
  };
}

const MLAnalysis: React.FC = () => {
  const [formData, setFormData] = useState<AnalysisRequest>({
    age: 8,
    attention_level: 5,
    social_interaction: 5,
    communication_skills: 5,
    behavioral_patterns: '',
    learning_preferences: []
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emotions = ['Happy', 'Sad', 'Angry', 'Fearful', 'Surprised', 'Disgusted', 'Neutral'];
  const learningPreferences = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'];
  const adaptiveLabels = ['Communication', 'Social Skills', 'Attention', 'Processing Speed', 'Memory', 'Pattern Recognition', 'Motor Skills', 'Language', 'Executive Function', 'Sensory Processing'];

  const handleInputChange = (field: keyof AnalysisRequest, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      learning_preferences: prev.learning_preferences.includes(preference)
        ? prev.learning_preferences.filter(p => p !== preference)
        : [...prev.learning_preferences, preference.toLowerCase()]
    }));
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Read API base URL from env; fall back to localhost:8000 for development
      const apiBase = (import.meta.env.VITE_ML_API_URL as string) || 'http://localhost:8000';
      const url = apiBase.replace(/\/$/, '') + '/simple-analysis';

      // Abort fetch after timeout to avoid hanging
      const controller = new AbortController();
      const timeoutMs = 10000; // 10s timeout
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // capture response body when possible for better error messages
        let bodyText = '';
  try { bodyText = await response.text(); } catch { /* ignore response body */ }
        throw new Error(`HTTP ${response.status}: ${response.statusText} ${bodyText ? '- ' + bodyText : ''}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      // Provide clearer guidance for typical network errors
      if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'AbortError') {
        setError('Request timed out after 10 seconds. Is the ML server running?');
      } else if (err instanceof TypeError && /failed to fetch/i.test(err.message)) {
        const apiBase = (import.meta.env.VITE_ML_API_URL as string) || 'http://localhost:8000';
        setError(`Cannot reach ML server at ${apiBase}. Check that the ML API process is running and that CORS allows requests from this origin.`);
      } else {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      }
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      'Happy': 'text-green-600',
      'Sad': 'text-blue-600',
      'Angry': 'text-red-600',
      'Fearful': 'text-purple-600',
      'Surprised': 'text-yellow-600',
      'Disgusted': 'text-gray-600',
      'Neutral': 'text-gray-500'
    };
    return colors[emotion] || 'text-gray-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
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
            <Brain className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">AI Neurodevelopmental Analysis</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced multimodal AI analysis for personalized neurodevelopmental insights and recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-indigo-600" />
              Assessment Input
            </h2>

            <div className="space-y-6">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Rating Scales */}
              {[
                { field: 'attention_level', label: 'Attention Level', icon: Target },
                { field: 'social_interaction', label: 'Social Interaction', icon: Users },
                { field: 'communication_skills', label: 'Communication Skills', icon: MessageCircle }
              ].map(({ field, label, icon: Icon }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Icon className="w-4 h-4 mr-1" />
                    {label} (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData[field as keyof AnalysisRequest] as number}
                    onChange={(e) => handleInputChange(field as keyof AnalysisRequest, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">
                    {formData[field as keyof AnalysisRequest]}
                  </div>
                </div>
              ))}

              {/* Behavioral Patterns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Behavioral Patterns
                </label>
                <textarea
                  value={formData.behavioral_patterns}
                  onChange={(e) => handleInputChange('behavioral_patterns', e.target.value)}
                  placeholder="Describe observed behavioral patterns..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Learning Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Preferences
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {learningPreferences.map((pref) => (
                    <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.learning_preferences.includes(pref.toLowerCase())}
                        onChange={() => handlePreferenceChange(pref)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Run Analysis Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runAnalysis}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Run AI Analysis'
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
              Analysis Results
            </h2>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                >
                  Error: {error}
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Emotion Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      Emotional State
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {emotions.map((emotion, index) => (
                        <div key={emotion} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className={`font-medium ${getEmotionColor(emotion)}`}>
                            {emotion}
                          </span>
                          <span className="text-sm text-gray-600">
                            {(result.emotion_prediction[index] * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attention Score */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-500" />
                      Attention Score
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Overall Attention</span>
                        <span className={`text-xl font-bold ${getScoreColor(result.attention_score)}`}>
                          {(result.attention_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${result.attention_score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Adaptive Learning Parameters */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-500" />
                      Cognitive Profile
                    </h3>
                    <div className="space-y-2">
                      {adaptiveLabels.map((label, index) => (
                        <div key={label} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <span className={`text-sm font-bold ${getScoreColor(result.adaptive_learning_params[index])}`}>
                            {(result.adaptive_learning_params[index] * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                      Personalized Recommendations
                    </h3>
                    <div className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-indigo-500 p-3 rounded"
                        >
                          <p className="text-sm text-gray-700">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!result && !loading && !error && (
                <div className="text-center text-gray-500 py-12">
                  <Brain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg">Run an analysis to see personalized insights</p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MLAnalysis;
