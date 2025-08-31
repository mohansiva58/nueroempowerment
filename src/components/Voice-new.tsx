import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type SupportedLanguage = 'en' | 'hi' | 'te';

// Enhanced language-to-voice mapping with multiple fallback options
const LANGUAGE_VOICE_MAP: Record<SupportedLanguage, string[]> = {
  'en': ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en'],
  'hi': ['hi-IN', 'hi', 'en-IN'],
  'te': ['te-IN', 'te', 'hi-IN', 'en-IN', 'en-US']
};

// Google Translate TTS API integration for better Telugu support
const speakWithGoogleTTS = async (text: string, language: string): Promise<boolean> => {
  try {
    console.log(`🎵 Attempting Google TTS for ${language}: "${text.substring(0, 50)}..."`);
    
    // Use Google Translate TTS API for better pronunciation
    const encodedText = encodeURIComponent(text);
    const langCode = language === 'te' ? 'te' : language === 'hi' ? 'hi' : 'en';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob&tk=1`;
    
    // Create audio element to play the TTS
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      let resolved = false;
      
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          audio.removeEventListener('loadstart', onLoadStart);
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
        }
      };
      
      const onLoadStart = () => {
        console.log('🔄 Google TTS loading...');
      };
      
      const onCanPlay = () => {
        console.log('✅ Google TTS ready, playing...');
        audio.play().catch(onError);
      };
      
      const onEnded = () => {
        console.log('✅ Google TTS completed successfully');
        cleanup();
        resolve(true);
      };
      
      const onError = (error: Event | ErrorEvent) => {
        console.warn('❌ Google TTS failed:', error);
        cleanup();
        resolve(false);
      };
      
      audio.addEventListener('loadstart', onLoadStart);
      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      
      // Set source and start loading
      audio.src = ttsUrl;
      audio.load();
      
      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          console.warn('⏰ Google TTS timeout after 10 seconds');
          cleanup();
          resolve(false);
        }
      }, 10000);
    });
  } catch (error) {
    console.error('❌ Google TTS error:', error);
    return false;
  }
};

// Web Speech API with Azure Cognitive Services fallback
const speakWithAzureTTS = async (text: string, language: string): Promise<boolean> => {
  try {
    // For production, you would use Azure Cognitive Services Speech SDK
    // This is a simplified version using fetch to Azure TTS endpoint
    console.log(`🎵 Attempting Azure TTS for ${language}: "${text.substring(0, 50)}..."`);
    
    // Note: In production, you'd need Azure subscription key and region
    // const subscriptionKey = 'YOUR_AZURE_SUBSCRIPTION_KEY';
    // const region = 'YOUR_AZURE_REGION';
    
    // For now, return false to fallback to other methods
    console.warn('Azure TTS requires subscription key - falling back to other methods');
    return false;
    
  } catch (error) {
    console.error('❌ Azure TTS error:', error);
    return false;
  }
};

// SpeechSynthesis API with enhanced voice selection
const speakWithBrowserTTS = async (text: string, language: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('❌ Browser TTS not supported');
      resolve(false);
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel(); // Cancel any ongoing speech

    // Get available voices
    const voices = synth.getVoices();
    console.log(`🔍 Looking for ${language} voice from ${voices.length} available voices`);

    // Find the best voice for the language
    const langCodes = LANGUAGE_VOICE_MAP[language as SupportedLanguage] || [language];
    let selectedVoice: SpeechSynthesisVoice | null = null;

    // Try to find exact language match first
    for (const langCode of langCodes) {
      selectedVoice = voices.find(voice => 
        voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
      ) || null;
      if (selectedVoice) {
        console.log(`✅ Found voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        break;
      }
    }

    // Fallback to any available voice if no match found
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices.find(v => v.default) || voices[0];
      console.log(`⚠️ Using fallback voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set language-specific parameters
    utterance.lang = langCodes[0];
    switch (language) {
      case 'te':
        utterance.rate = 0.7;  // Slower for Telugu
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        break;
      case 'hi':
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        break;
      default: // English
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
    }

    utterance.onstart = () => {
      console.log(`✅ Browser TTS started for ${language}`);
    };

    utterance.onend = () => {
      console.log(`✅ Browser TTS completed for ${language}`);
      resolve(true);
    };

    utterance.onerror = (event) => {
      console.warn(`❌ Browser TTS failed for ${language}:`, event.error);
      resolve(false);
    };

    try {
      synth.speak(utterance);
      console.log(`📢 Browser TTS command sent for ${language}`);
    } catch (error) {
      console.error('❌ Failed to start browser TTS:', error);
      resolve(false);
    }
  });
};

export const useSpeech = () => {
  const speechRef = useRef<SpeechSynthesis | null>(null);
  const { locale } = useLanguage();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = speechRef.current?.getVoices() || [];
        console.log('📊 Available voices:', voices.length);
        setAvailableVoices(voices);
        
        // Log Telugu voices specifically
        const teluguVoices = voices.filter(v => 
          v.lang.toLowerCase().includes('te') || 
          v.name.toLowerCase().includes('telugu')
        );
        console.log('🇮🇳 Telugu voices found:', teluguVoices.length);
        teluguVoices.forEach(v => console.log(`   - ${v.name} (${v.lang})`));
      };

      loadVoices();
      speechRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback(async (text: string, overrideLanguage?: SupportedLanguage) => {
    if (!text || text.trim() === '') {
      console.warn('⚠️ Empty text provided to speech');
      return;
    }

    const targetLanguage = overrideLanguage || locale;
    console.log(`\n🎙️ SPEECH REQUEST: "${text}" in language: ${targetLanguage}`);

    // Stop any ongoing speech
    if (speechRef.current) {
      speechRef.current.cancel();
    }

    // Try multiple TTS methods in order of preference
    const ttsMethodsInOrder = [
      // For Telugu, try external APIs first for better quality
      ...(targetLanguage === 'te' ? [
        () => speakWithGoogleTTS(text, targetLanguage),
        () => speakWithAzureTTS(text, targetLanguage)
      ] : []),
      // Always try browser TTS as fallback
      () => speakWithBrowserTTS(text, targetLanguage)
    ];

    let success = false;
    for (let i = 0; i < ttsMethodsInOrder.length && !success; i++) {
      const method = ttsMethodsInOrder[i];
      console.log(`🔄 Trying TTS method ${i + 1}/${ttsMethodsInOrder.length}...`);
      
      try {
        success = await method();
        if (success) {
          console.log(`✅ TTS method ${i + 1} succeeded!`);
          break;
        }
      } catch (error) {
        console.warn(`❌ TTS method ${i + 1} failed:`, error);
      }
    }

    if (!success) {
      console.error('❌ All TTS methods failed');
      // Final fallback: try browser TTS with English for any language
      if (targetLanguage !== 'en') {
        console.log('🔄 Final fallback: English browser TTS');
        await speakWithBrowserTTS(text, 'en');
      }
    }
  }, [locale]);

  const stop = useCallback(() => {
    if (speechRef.current) {
      speechRef.current.cancel();
      console.log('⏹️ Speech stopped');
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
