import React, { useState, useEffect } from 'react';
import { useSpeech } from './Voice';
import { useLanguage } from '../contexts/LanguageContext';
import { FormattedMessage, useIntl } from 'react-intl';
import { VolumeX, Settings, Play } from 'lucide-react';

interface SpeechSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpeechSettings: React.FC<SpeechSettingsProps> = ({ isOpen, onClose }) => {
  const { speak, getAvailableVoices, isSupported } = useSpeech();
  const { locale } = useLanguage();
  const intl = useIntl();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Load voices when component mounts
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    // Re-load voices after a short delay (for browser compatibility)
    const timer = setTimeout(loadVoices, 500);

    return () => clearTimeout(timer);
  }, [getAvailableVoices]);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('speechSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setSpeechRate(settings.rate || 1.0);
        setSpeechPitch(settings.pitch || 1.0);
        setSpeechEnabled(settings.enabled !== undefined ? settings.enabled : true);
        setSelectedVoice(settings.voice || '');
      } catch (error) {
        console.error('Failed to load speech settings:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      rate: speechRate,
      pitch: speechPitch,
      enabled: speechEnabled,
      voice: selectedVoice
    };
    localStorage.setItem('speechSettings', JSON.stringify(settings));
  };

  const testSpeech = () => {
    const testText = intl.formatMessage({ 
      id: 'speech.sample_text', 
      defaultMessage: 'This is a sample text to test speech synthesis.' 
    });
    
    speak(testText, locale);
  };

  const getLanguageVoices = () => {
    const langPrefixes = {
      'en': ['en-'],
      'hi': ['hi-', 'hindi'],
      'te': ['te-', 'telugu']
    };

    const currentPrefixes = langPrefixes[locale as keyof typeof langPrefixes] || ['en-'];
    
    return voices.filter(voice => 
      currentPrefixes.some(prefix => 
        voice.lang.toLowerCase().startsWith(prefix) ||
        voice.name.toLowerCase().includes(prefix.replace('-', ''))
      )
    );
  };

  if (!isSupported()) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-black">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <FormattedMessage id="speech.settings_title" defaultMessage="Speech Settings" />
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <VolumeX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Speech */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              <FormattedMessage id="speech.enable_speech" defaultMessage="Enable Speech" />
            </label>
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                saveSettings();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                speechEnabled ? 'bg-black' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  speechEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {speechEnabled && (
            <>
              {/* Voice Selection */}
              {getLanguageVoices().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FormattedMessage id="speech.voice_selection" defaultMessage="Voice" />
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => {
                      setSelectedVoice(e.target.value);
                      saveSettings();
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">
                      <FormattedMessage id="speech.default_voice" defaultMessage="Default Voice" />
                    </option>
                    {getLanguageVoices().map((voice, index) => (
                      <option key={index} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speech Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FormattedMessage id="speech.rate" defaultMessage="Speed" />: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => {
                    setSpeechRate(parseFloat(e.target.value));
                    saveSettings();
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Speech Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FormattedMessage id="speech.pitch" defaultMessage="Pitch" />: {speechPitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechPitch}
                  onChange={(e) => {
                    setSpeechPitch(parseFloat(e.target.value));
                    saveSettings();
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Test Speech Button */}
              <button
                onClick={testSpeech}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Play className="w-4 h-4" />
                <FormattedMessage id="speech.test_voice" defaultMessage="Test Voice" />
              </button>
            </>
          )}
        </div>

        {/* Language Info */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <FormattedMessage 
              id="speech.current_language" 
              defaultMessage="Current language: {language}"
              values={{ 
                language: locale === 'en' ? 'English' : locale === 'hi' ? 'हिन्दी' : 'తెలుగు'
              }}
            />
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <FormattedMessage 
              id="speech.hover_to_speak" 
              defaultMessage="Hover over any text to hear it spoken in your selected language."
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeechSettings;
