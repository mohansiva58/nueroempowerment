import React from 'react';
import { useSpeech } from './Voice';
import { useLanguage } from '../contexts/LanguageContext';

const VoiceTester: React.FC = () => {
  const { speak, getAvailableVoices, getTeluguVoices, debugVoices, isSupported } = useSpeech();
  const { locale, changeLanguage } = useLanguage();

  const testTeluguSpeech = () => {
    const teluguText = "హలో! ఇది తెలుగు వాక్ పరీక్ష. లర్నింగ్ మరియు గేమ్స్.";
    speak(teluguText, 'te');
  };

  const testTeluguTransliteration = () => {
    const teluguText = "తెలుగు వాక్ సెట్టింగులు";
    console.log('Testing Telugu text:', teluguText);
    speak(teluguText, 'te');
  };

  const testHindiSpeech = () => {
    const hindiText = "नमस्ते! यह हिंदी आवाज़ परीक्षण है।";
    speak(hindiText, 'hi');
  };

  const testEnglishSpeech = () => {
    const englishText = "Hello! This is English speech test.";
    speak(englishText, 'en');
  };

  const logAllVoices = () => {
    debugVoices();
    console.log('Telugu-specific voices:');
    getTeluguVoices();
    
    // Additional diagnostics
    const voices = getAvailableVoices();
    console.log('=== VOICE DIAGNOSTICS ===');
    console.log('Total voices found:', voices.length);
    
    if (voices.length === 0) {
      console.error('❌ NO VOICES FOUND!');
      console.log('This usually means:');
      console.log('1. 🔊 Your system has no TTS voices installed');
      console.log('2. 🌐 Browser needs permission to access speech');
      console.log('3. ⏱️ Voices are still loading (try again in a few seconds)');
      console.log('4. 🚫 Speech synthesis is disabled/blocked');
      
      // Try to force load voices
      if ('speechSynthesis' in window) {
        console.log('Attempting to force-load voices...');
        const newVoices = window.speechSynthesis.getVoices();
        console.log('Force-loaded voices:', newVoices.length);
      }
    } else {
      console.log('✅ Voices available:');
      const languageGroups = voices.reduce((groups, voice) => {
        const lang = voice.lang.split('-')[0];
        if (!groups[lang]) groups[lang] = [];
        groups[lang].push(voice);
        return groups;
      }, {} as Record<string, SpeechSynthesisVoice[]>);
      
      Object.entries(languageGroups).forEach(([lang, voicesInLang]) => {
        console.log(`📢 ${lang.toUpperCase()}: ${voicesInLang.length} voices`);
        voicesInLang.forEach(voice => {
          console.log(`   - ${voice.name} (${voice.lang}) ${voice.default ? '⭐ DEFAULT' : ''}`);
        });
      });
    }
    console.log('=== END DIAGNOSTICS ===');
  };

  const forceReloadVoices = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Force reload
      const voices = window.speechSynthesis.getVoices();
      console.log('🔄 Force reloaded', voices.length, 'voices');
      
      // Wait a bit and try again
      setTimeout(() => {
        const voices2 = window.speechSynthesis.getVoices();
        console.log('🔄 Second attempt found', voices2.length, 'voices');
  const testSystemBasic = () => {
    console.log('🧪 BASIC SYSTEM TEST');
    console.log('Speech Synthesis supported:', 'speechSynthesis' in window);
    
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      console.log('Speech synthesis object:', !!synth);
      
      // Try basic speech without any voice selection
      const utterance = new SpeechSynthesisUtterance('Testing basic system speech');
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => console.log('✅ Basic speech started successfully!');
      utterance.onend = () => console.log('✅ Basic speech completed!');
      utterance.onerror = (e) => console.error('❌ Basic speech failed:', e.error);
      
      try {
        synth.speak(utterance);
        console.log('📢 Basic speech command sent');
      } catch (error) {
        console.error('❌ Failed to send basic speech command:', error);
      }
    }
  };

  if (!isSupported()) {
    return (
      <div className="p-4 bg-red-100 rounded-lg">
        <p className="text-red-800">Speech synthesis is not supported in your browser.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Voice Tester - Debug Tool
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Current Language: <strong>{locale}</strong>
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Available Voices: <strong>{getAvailableVoices().length}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testEnglishSpeech}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          Test English Speech
        </button>
        
        <button
          onClick={testHindiSpeech}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          Test Hindi Speech
        </button>
        
        <button
          onClick={testTeluguSpeech}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          Test Telugu Speech
        </button>

        <button
          onClick={testTeluguTransliteration}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          Telugu + Transliteration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={logAllVoices}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          🔍 Debug: Full Voice Analysis
        </button>
        
        <button
          onClick={forceReloadVoices}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          🔄 Force Reload Voices
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Quick Language Switch:
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 rounded-md transition-colors ${
              locale === 'en' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('hi')}
            className={`px-4 py-2 rounded-md transition-colors ${
              locale === 'hi' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => changeLanguage('te')}
            className={`px-4 py-2 rounded-md transition-colors ${
              locale === 'te' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300'
            }`}
          >
            తెలుగు
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-1">
          <strong>Note:</strong> Telugu voices may not be available on all systems.
        </p>
        <p className="mb-1">
          <strong>New:</strong> If Telugu speech doesn't work, the system will automatically convert Telugu text to phonetic English for better pronunciation.
        </p>
        <p className="mb-1">
          The "Telugu + Transliteration" button demonstrates this fallback mechanism.
        </p>
        <p>
          Check the browser console for detailed voice information and transliteration process.
        </p>
      </div>
    </div>
  );
};

export default VoiceTester;
