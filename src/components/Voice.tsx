import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpeechSettings } from '../contexts/SpeechSettingsContext';

type SupportedLanguage = 'en' | 'hi' | 'te';

// Enhanced language-to-voice mapping with multiple fallback options
const LANGUAGE_VOICE_MAP: Record<SupportedLanguage, string[]> = {
  'en': ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en'],
  'hi': ['hi-IN', 'hi', 'en-IN'],
  'te': ['te-IN', 'te', 'hi-IN', 'en-IN', 'en-US']
};

// Enhanced Web Speech API with better voice selection and error handling
const speakWithEnhancedBrowserTTS = async (text: string, language: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('❌ Browser TTS not supported');
      resolve(false);
      return;
    }

    const synth = window.speechSynthesis;
    // Only cancel if currently speaking to avoid unnecessary interruptions
    if (synth.speaking) {
      synth.cancel();
    }

    // Get available voices immediately (no retries for speed)
    const voices = synth.getVoices();
    console.log(`🔍 Enhanced TTS: Looking for ${language} voice from ${voices.length} available voices`);

    // Enhanced voice selection specifically optimized for Telugu
    const findBestVoice = (lang: string): SpeechSynthesisVoice | null => {
      const langCodes = LANGUAGE_VOICE_MAP[lang as SupportedLanguage] || [lang];
      
      // Special handling for Telugu
      if (lang === 'te') {
        // Try to find any Telugu voice first
        const teluguVoice = voices.find(v => 
          v.lang.toLowerCase().includes('te') || 
          v.name.toLowerCase().includes('telugu')
        );
        if (teluguVoice) {
          console.log(`🇮🇳 Found Telugu voice: ${teluguVoice.name} (${teluguVoice.lang})`);
          return teluguVoice;
        }

        // Fallback to Indian English voices for Telugu
        const indianVoices = voices.filter(v => 
          v.lang.toLowerCase().includes('in') || 
          v.name.toLowerCase().includes('india') ||
          v.lang.toLowerCase().includes('en-in')
        );
        if (indianVoices.length > 0) {
          const selectedVoice = indianVoices[0];
          console.log(`🇮🇳 Using Indian English for Telugu: ${selectedVoice.name} (${selectedVoice.lang})`);
          return selectedVoice;
        }
      }
      
      // Standard voice selection for other languages
      for (const langCode of langCodes) {
        // Try exact match first
        let voice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
        if (voice) {
          console.log(`✅ Found exact match: ${voice.name} (${voice.lang})`);
          return voice;
        }
        
        // Try partial match
        voice = voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
        if (voice) {
          console.log(`✅ Found language match: ${voice.name} (${voice.lang})`);
          return voice;
        }
      }
      
      return null;
    };

    const selectedVoice = findBestVoice(language);
    const finalVoice = selectedVoice || (voices.length > 0 ? (voices.find(v => v.default) || voices[0]) : null);
    
    if (finalVoice) {
      console.log(`🎵 Enhanced TTS using: ${finalVoice.name} (${finalVoice.lang}) for ${language}`);
    } else {
      console.warn(`⚠️ No voice available for ${language}, using system default`);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (finalVoice) {
      utterance.voice = finalVoice;
    }
    
    // Enhanced language-specific parameters
    const langCodes = LANGUAGE_VOICE_MAP[language as SupportedLanguage] || [language];
    utterance.lang = langCodes[0];
    
    switch (language) {
      case 'te':
        utterance.rate = 1.2;  // Faster Telugu speech
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        break;
      case 'hi':
        utterance.rate = 1.1;  // Faster Hindi speech
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        break;
      default: // English
        utterance.rate = 1.3;  // Faster English speech
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
    }

    utterance.onstart = () => {
      console.log(`✅ Enhanced TTS started for ${language}`);
    };

    utterance.onend = () => {
      console.log(`✅ Enhanced TTS completed for ${language}`);
      resolve(true);
    };

    utterance.onerror = () => {
      console.warn(`❌ Enhanced TTS failed for ${language}: interrupted`);
      resolve(false);
    };

    try {
      synth.speak(utterance);
      console.log(`📢 Enhanced TTS command sent for ${language}: "${text.substring(0, 30)}..."`);
    } catch {
      console.error('❌ Failed to start enhanced TTS');
      resolve(false);
    }
  });
};
// SpeechSynthesis API with enhanced voice selection
const speakWithBrowserTTS = async (text: string, language: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      //console.warn('❌ Browser TTS not supported');
      resolve(false);
      return;
    }

    const synth = window.speechSynthesis;
    // Only cancel if currently speaking to avoid interruptions
    if (synth.speaking) {
      synth.cancel();
    }

    // Get available voices
    const voices = synth.getVoices();
   // console.log(`🔍 Looking for ${language} voice from ${voices.length} available voices`);

    // Find the best voice for the language
    const langCodes = LANGUAGE_VOICE_MAP[language as SupportedLanguage] || [language];
    let selectedVoice: SpeechSynthesisVoice | null = null;

    // Try to find exact language match first
    for (const langCode of langCodes) {
      selectedVoice = voices.find(voice => 
        voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
      ) || null;
      if (selectedVoice) {
       // console.log(`✅ Found voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        break;
      }
    }

    // Fallback to any available voice if no match found
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices.find(v => v.default) || voices[0];
     // console.log(`⚠️ Using fallback voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set language-specific parameters
    utterance.lang = langCodes[0];
    switch (language) {
      case 'te':
        utterance.rate = 1.2;  // Faster Telugu speech
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        break;
      case 'hi':
        utterance.rate = 1.1;  // Faster Hindi speech
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        break;
      default: // English
        utterance.rate = 1.3;  // Faster English speech
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
    }

    utterance.onstart = () => {
      //console.log(`✅ Browser TTS started for ${language}`);
    };

    utterance.onend = () => {
      //console.log(`✅ Browser TTS completed for ${language}`);
      resolve(true);
    };

    utterance.onerror = () => {
     // console.warn(`❌ Browser TTS failed for ${language}:`, event.error);
      resolve(false);
    };

    try {
      synth.speak(utterance);
     // console.log(`📢 Browser TTS command sent for ${language}`);
    } catch {
      //console.error('❌ Failed to start browser TTS:', error);
      resolve(false);
    }
  });
};

export const useSpeech = () => {
  const speechRef = useRef<SpeechSynthesis | null>(null);
  const { locale } = useLanguage();
  const { isSpeechEnabled } = useSpeechSettings();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = speechRef.current?.getVoices() || [];
      //  console.log('📊 Available voices:', voices.length);
        setAvailableVoices(voices);
        
        // Log Telugu voices specifically
        const teluguVoices = voices.filter(v => 
          v.lang.toLowerCase().includes('te') || 
          v.name.toLowerCase().includes('telugu')
        );
      //  console.log('🇮🇳 Telugu voices found:', teluguVoices.length);
        teluguVoices.forEach(v => console.log(`   - ${v.name} (${v.lang})`));
      };

      loadVoices();
      speechRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback(async (text: string, overrideLanguage?: SupportedLanguage) => {
    // Check if speech is globally enabled
    if (!isSpeechEnabled) {
     // console.log('🔇 Speech is disabled - skipping TTS');
      return;
    }

    if (!text || text.trim() === '') {
     // console.warn('⚠️ Empty text provided to speech');
      return;
    }

    const targetLanguage = overrideLanguage || locale;
    // console.log(`\n🎙️ SPEECH REQUEST: "${text}" in language: ${targetLanguage}`);

    // Stop any ongoing speech only if actively speaking
    if (speechRef.current && speechRef.current.speaking) {
      speechRef.current.cancel();
    }

    // Try multiple TTS methods in order of preference
    const ttsMethodsInOrder = [
      // For all languages, use enhanced browser TTS with better voice selection
      () => speakWithEnhancedBrowserTTS(text, targetLanguage),
      // Fallback to basic browser TTS if enhanced fails
      () => speakWithBrowserTTS(text, targetLanguage)
    ];

    let success = false;
    for (let i = 0; i < ttsMethodsInOrder.length && !success; i++) {
      const method = ttsMethodsInOrder[i];
      //console.log(`🔄 Trying TTS method ${i + 1}/${ttsMethodsInOrder.length}...`);
      
      try {
        success = await method();
        if (success) {
          //console.log(`✅ TTS method ${i + 1} succeeded!`);
          break;
        }
      } catch {
       // console.warn(`❌ TTS method ${i + 1} failed:`, error);
      }
    }

    if (!success) {
     // console.error('❌ All TTS methods failed');
      // Final fallback: try browser TTS with English for any language
      if (targetLanguage !== 'en') {
        //console.log('🔄 Final fallback: English browser TTS');
        await speakWithBrowserTTS(text, 'en');
      }
    }
  }, [locale, isSpeechEnabled]);

  const stop = useCallback(() => {
    if (speechRef.current) {
      speechRef.current.cancel();
      //console.log('⏹️ Speech stopped');
    }
  }, []);

  const getAvailableVoices = useCallback(() => {
    return availableVoices;
  }, [availableVoices]);

  const isSupported = useCallback(() => {
    return 'speechSynthesis' in window;
  }, []);

  const isSpeaking = useCallback(() => {
    return speechRef.current?.speaking || false;
  }, []);

  return {
    speak,
    stop,
    getAvailableVoices,
    isSupported,
    isSpeaking
  };
};
