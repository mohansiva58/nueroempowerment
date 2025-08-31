import React from 'react';
import { useSpeech } from './Voice';
import { useLanguage } from '../contexts/LanguageContext';

const VoiceTesterSimple: React.FC = () => {
  const { speak, isSpeaking } = useSpeech();
  const { locale: currentLanguage } = useLanguage();

  const testPhrases = {
    en: [
      "Hello, this is a test of the enhanced speech system.",
      "The enhanced browser TTS provides high-quality multilingual speech synthesis.",
      "Testing speech clarity and pronunciation quality."
    ],
    te: [
      "నమస్కారం, ఇది మెరుగైన వాక్ వ్యవస్థ యొక్క పరీక్ష.",
      "తెలుగు భాషలో స్పష్టంగా మాట్లాడుతున్నాను.",
      "మెరుగైన బ్రౌజర్ టిటిఎస్ అధిక-నాణ్యత భాషా సంశ్లేషణ అందిస్తుంది.",
      "వాక్ స్పష్టత మరియు ఉచ్చారణ నాణ్యతను పరీక్షిస్తోంది."
    ],
    hi: [
      "नमस्ते, यह उन्नत भाषण प्रणाली का परीक्षण है।",
      "हिंदी में स्पष्ट रूप से बोल रहा हूं।",
      "उन्नत ब्राउज़र टीटीएस उच्च-गुणवत्ता भाषा संश्लेषण प्रदान करता है।"
    ]
  };

  const handleTestSpeech = (text: string) => {
    speak(text, currentLanguage as 'en' | 'hi' | 'te');
  };

  const currentPhrases = testPhrases[currentLanguage as keyof typeof testPhrases] || testPhrases.en;
  const isLoading = isSpeaking();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Enhanced Speech System Tester
      </h2>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Enhanced Features:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✨ Enhanced Browser TTS with smart voice selection</li>
          <li>🎯 Telugu-specific voice optimization with Indian English fallbacks</li>
          <li>⚡ Improved speech rate (0.85x for Telugu clarity)</li>
          <li>🔄 Intelligent voice matching algorithm</li>
          <li>🌐 Cross-platform compatibility</li>
          <li>🎛️ Global speech toggle control</li>
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Current Language: <span className="font-semibold">{currentLanguage.toUpperCase()}</span>
        </p>
        {isLoading && (
          <p className="text-blue-600 dark:text-blue-400">Processing speech...</p>
        )}
      </div>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Test Phrases ({currentLanguage.toUpperCase()})
        </h3>
        {currentPhrases.map((phrase, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 mb-3">{phrase}</p>
            <button
              onClick={() => handleTestSpeech(phrase)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Speaking...' : `Speak in ${currentLanguage.toUpperCase()}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Note:</h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          This system uses Enhanced Browser TTS with intelligent voice selection for optimal speech quality across all languages, 
          especially optimized for Telugu with Indian English voice fallbacks.
        </p>
      </div>
    </div>
  );
};

export default VoiceTesterSimple;
