import { useCallback, useRef, useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Language to voice mapping for better speech synthesis
const LANGUAGE_VOICE_MAP: Record<string, string[]> = {
  'en': ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN'],
  'hi': ['hi-IN', 'hi'],
  'te': ['te-IN', 'te', 'en-IN'] // Include en-IN as fallback for Telugu
};

type SupportedLanguage = 'en' | 'hi' | 'te';

// Enhanced Telugu to phonetic English transliteration for better pronunciation
const teluguTransliterationMap: Record<string, string> = {
  // Complete Telugu vowels
  'అ': 'a', 'ఆ': 'aa', 'ఇ': 'i', 'ఈ': 'ee', 'ఉ': 'u', 'ఊ': 'oo',
  'ఎ': 'e', 'ఏ': 'ae', 'ఒ': 'o', 'ఓ': 'oh', 'ౠ': 'ru', 'ౡ': 'lru',
  
  // Telugu vowel marks (matras)
  'ా': 'aa', 'ి': 'i', 'ీ': 'ee', 'ు': 'u', 'ూ': 'oo', 'ె': 'e', 
  'ే': 'ae', 'ై': 'ai', 'ొ': 'o', 'ో': 'oh', 'ౌ': 'au', 'ం': 'am', 'ః': 'ah',
  
  // Telugu consonants with better phonetics
  'క': 'ka', 'ఖ': 'kha', 'గ': 'ga', 'ఘ': 'gha', 'ఙ': 'nga',
  'చ': 'cha', 'ఛ': 'chha', 'జ': 'ja', 'ఝ': 'jha', 'ఞ': 'nja',
  'ట': 'ta', 'ఠ': 'tha', 'డ': 'da', 'ఢ': 'dha', 'ణ': 'na',
  'త': 'tha', 'థ': 'thha', 'ద': 'dha', 'ధ': 'dhha', 'న': 'na',
  'ప': 'pa', 'ఫ': 'pha', 'బ': 'ba', 'భ': 'bha', 'మ': 'ma',
  'య': 'ya', 'ర': 'ra', 'ల': 'la', 'వ': 'va', 'శ': 'sha',
  'ష': 'sha', 'స': 'sa', 'హ': 'ha', 'ళ': 'lla', 'క్ష': 'ksha', 'జ్ఞ': 'gnja',
  
  // Common Telugu words and phrases
  'హలో': 'hello', 'నమస్తే': 'namaste', 'నమస్కారం': 'namaskaaram',
  'ధన్యవాదాలు': 'dhanyavaadaalu', 'క్షమించండి': 'kshaminchaandi',
  'తెలుగు': 'telugu', 'భాష': 'bhaasha', 'మాట': 'maata', 'మాటలు': 'maataalu',
  
  // Website navigation terms
  'హోమ్': 'home', 'గేమ్స్': 'games', 'లర్నింగ్': 'learning', 'ప్రొఫైల్': 'profile',
  'సెట్టింగులు': 'settingulu', 'సెట్టింగ్స్': 'settings', 'లాగిన్': 'login',
  'లాగౌట్': 'logout', 'రిజిస్టర్': 'register', 'సైన్అప్': 'signup',
  'మెనూ': 'menu', 'నావిగేషన్': 'navigation', 'పేజ్': 'page', 'సర్చ్': 'search',
  
  // Speech and audio terms
  'స్పీచ్': 'speech', 'వాయిస్': 'voice', 'ఆడియో': 'audio', 'సౌండ్': 'sound',
  'సింథసిస్': 'synthesis', 'టెక్స్ట్': 'text', 'రీడింగ్': 'reading',
  'వాక్యం': 'vaakyam', 'శబ్దం': 'shabdam', 'స్వరం': 'swaram',
  'వేగం': 'vegam', 'స్పీడ్': 'speed', 'పిచ్': 'pitch', 'వాల్యూమ్': 'volume',
  'రేట్': 'rate', 'టోన్': 'tone', 'యాక్సెంట్': 'accent',
  
  // Control and interaction terms  
  'ప్లే': 'play', 'స్టాప్': 'stop', 'పాజ్': 'pause', 'రెజ్యూమ్': 'resume',
  'స్టార్ట్': 'start', 'ఎండ్': 'end', 'రిపీట్': 'repeat', 'లూప్': 'loop',
  'క్లిక్': 'click', 'టచ్': 'touch', 'ప్రెస్': 'press', 'సెలెక్ట్': 'select',
  'చూస్': 'choose', 'ఎంపిక': 'empika', 'ఎంపికలు': 'empikalu', 'ఆప్షన్': 'option',
  
  // Status and feedback terms
  'ప్రారంభం': 'prarambham', 'ప్రారంభించు': 'prarambhinchu', 'మొదలుపెట్టు': 'modalupettu',
  'ఆపు': 'aapu', 'నిలిపి': 'nilipi', 'నిలిపివేయు': 'nilipiveeyu', 'బంద్': 'band',
  'చాలు': 'chaalu', 'ముగించు': 'muginchu', 'పూర్తి': 'poorti', 'కంప్లీట్': 'complete',
  'అందుబాటులో': 'andubaatuloo', 'అవైలబుల్': 'available', 'లేదు': 'leedu', 'లేవు': 'leevu',
  'ఉంది': 'undi', 'ఉన్నాయి': 'unnayi', 'ఉన్నది': 'unnadi', 'ఎనేబుల్': 'enable',
  'డిసేబుల్': 'disable', 'ఆన్': 'on', 'ఆఫ్': 'off', 'యెస్': 'yes', 'నో': 'no',
  
  // Common application terms
  'ఫీచర్': 'feature', 'ఫంక్షన్': 'function', 'టూల్': 'tool', 'యుటిలిటీ': 'utility',
  'హెల్ప్': 'help', 'సపోర్ట్': 'support', 'గైడ్': 'guide', 'ట్యుటోరియల్': 'tutorial',
  'డెమో': 'demo', 'టెస్ట్': 'test', 'ట్రై': 'try', 'సాంపుల్': 'sample',
  'నమూనా': 'namoona', 'ఉదాహరణ': 'udaaharana', 'ఎగ్జాంపుల్': 'example'
};

// Enhanced function to convert Telugu text to phonetic English
const transliterateTeluguToPhonetic = (teluguText: string): string => {
  let phoneticText = teluguText;
  
  console.log(`Starting transliteration for: "${teluguText}"`);
  
  // First, handle complete words (longest matches first)
  const sortedKeys = Object.keys(teluguTransliterationMap).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(telugu => {
    if (phoneticText.includes(telugu)) {
      const phonetic = teluguTransliterationMap[telugu];
      // Use word boundary aware replacement for complete words
      const globalRegex = new RegExp(telugu.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const beforeReplace = phoneticText;
      phoneticText = phoneticText.replace(globalRegex, phonetic);
      if (beforeReplace !== phoneticText) {
        console.log(`Replaced "${telugu}" -> "${phonetic}"`);
      }
    }
  });
  
  // Handle any remaining Telugu characters with basic consonant + vowel combinations
  phoneticText = phoneticText.replace(/([క-హ])([ా-ౌ])/g, (match, consonant, vowel) => {
    const consonantPhonetic = teluguTransliterationMap[consonant] || consonant;
    const vowelPhonetic = teluguTransliterationMap[vowel] || vowel;
    return consonantPhonetic + vowelPhonetic;
  });
  
  // Handle standalone Telugu characters that weren't caught above
  Object.entries(teluguTransliterationMap).forEach(([telugu, phonetic]) => {
    if (telugu.length === 1 && phoneticText.includes(telugu)) {
      const regex = new RegExp(telugu, 'g');
      phoneticText = phoneticText.replace(regex, phonetic);
    }
  });
  
  // Remove virama (్) marks that break pronunciation
  phoneticText = phoneticText.replace(/్/g, '');
  
  // Clean up: normalize spaces, remove extra characters
  phoneticText = phoneticText
    .replace(/\s+/g, ' ')           // Multiple spaces to single
    .replace(/[^\w\s.-]/g, '')      // Remove special characters except word chars, spaces, dots, hyphens
    .trim();                        // Remove leading/trailing spaces
  
  // Improve pronunciation by adding slight pauses between words
  phoneticText = phoneticText.replace(/\b(\w+)\b/g, '$1,');
  phoneticText = phoneticText.replace(/,\s*$/, ''); // Remove trailing comma
  
  console.log(`Final transliterated result: "${teluguText}" -> "${phoneticText}"`);
  return phoneticText;
};

export const useSpeech = () => {
  const speechRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { locale } = useLanguage();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices when component mounts or voices change
  useEffect(() => {
    if (!speechRef.current) {
      speechRef.current = window.speechSynthesis;
    }

    const loadVoices = () => {
      const voices = speechRef.current?.getVoices() || [];
      console.log('Loading voices, found:', voices.length);
      setAvailableVoices(voices);
      
      if (voices.length === 0) {
        console.warn('No voices found. This might be due to:');
        console.warn('1. Browser permissions not granted');
        console.warn('2. Voices still loading (will retry)');
        console.warn('3. Browser/system TTS not available');
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Also load voices when they become available (some browsers load them asynchronously)
    if (speechRef.current) {
      speechRef.current.onvoiceschanged = loadVoices;
    }

    // Retry loading voices after delays (for browsers that load them slowly)
    const retryTimers = [500, 1000, 2000].map(delay => 
      setTimeout(loadVoices, delay)
    );

    return () => {
      if (speechRef.current) {
        speechRef.current.onvoiceschanged = null;
      }
      retryTimers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Find the best voice for the current language
  const getBestVoice = useCallback((targetLanguage: string): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) {
      console.warn('No voices available yet. Voices may still be loading...');
      return null;
    }

    console.log(`Looking for voice for language: ${targetLanguage} from ${availableVoices.length} available voices`);

    const possibleLangs = LANGUAGE_VOICE_MAP[targetLanguage as SupportedLanguage] || [targetLanguage];
    
    // First, try to find an exact match
    for (const lang of possibleLangs) {
      const exactMatch = availableVoices.find(voice => 
        voice.lang.toLowerCase() === lang.toLowerCase()
      );
      if (exactMatch) {
        console.log('Found exact voice match:', exactMatch.name, exactMatch.lang);
        return exactMatch;
      }
    }

    // Then, try to find a partial match (e.g., 'hi' matches 'hi-IN')
    for (const lang of possibleLangs) {
      const partialMatch = availableVoices.find(voice => 
        voice.lang.toLowerCase().startsWith(lang.toLowerCase()) ||
        lang.toLowerCase().startsWith(voice.lang.toLowerCase())
      );
      if (partialMatch) {
        console.log('Found partial voice match:', partialMatch.name, partialMatch.lang);
        return partialMatch;
      }
    }

    // For Hindi and Telugu, also try some common alternatives
    if (targetLanguage === 'hi') {
      const hindiAlts = availableVoices.filter(voice => 
        voice.lang.includes('hi') || 
        voice.name.toLowerCase().includes('hindi') ||
        voice.name.toLowerCase().includes('devanagari')
      );
      if (hindiAlts.length > 0) {
        console.log('Found Hindi alternative:', hindiAlts[0].name, hindiAlts[0].lang);
        return hindiAlts[0];
      }
    }

    if (targetLanguage === 'te') {
      // Look for Telugu voices with various patterns
      const teluguAlts = availableVoices.filter(voice => 
        voice.lang.includes('te') || 
        voice.name.toLowerCase().includes('telugu') ||
        voice.lang.toLowerCase() === 'te-in' ||
        voice.name.toLowerCase().includes('telugu')
      );
      if (teluguAlts.length > 0) {
        console.log('Telugu voice found:', teluguAlts[0].name, teluguAlts[0].lang);
        return teluguAlts[0];
      }
      
      // If no Telugu voice, try to find an Indian English voice as fallback
      const indianVoice = availableVoices.find(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.toLowerCase().includes('india')
      );
      if (indianVoice) {
        console.log('Using Indian English voice as Telugu fallback:', indianVoice.name);
        return indianVoice;
      }

      // If no Indian voice, try to find any English voice that might work better
      const englishVoices = availableVoices.filter(voice => 
        voice.lang.toLowerCase().startsWith('en')
      );
      if (englishVoices.length > 0) {
        // Prefer female voices for Telugu (often sound better)
        const femaleVoice = englishVoices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('samantha')
        );
        if (femaleVoice) {
          console.log('Using female English voice as Telugu fallback:', femaleVoice.name);
          return femaleVoice;
        }
        
        console.log('Using first available English voice as Telugu fallback:', englishVoices[0].name);
        return englishVoices[0];
      }
    }

    // For English, be more aggressive about finding any English-like voice
    if (targetLanguage === 'en') {
      const englishVoices = availableVoices.filter(voice => 
        voice.lang.toLowerCase().startsWith('en') ||
        voice.name.toLowerCase().includes('english') ||
        voice.name.toLowerCase().includes('en')
      );
      if (englishVoices.length > 0) {
        console.log('Found English voice:', englishVoices[0].name, englishVoices[0].lang);
        return englishVoices[0];
      }
    }

    // Last resort: try default voice or any available voice
    const defaultVoice = availableVoices.find(voice => voice.default);
    if (defaultVoice) {
      console.log('Using default voice as last resort:', defaultVoice.name, defaultVoice.lang);
      return defaultVoice;
    }

    if (availableVoices.length > 0) {
      console.log('Using first available voice as absolute last resort:', availableVoices[0].name, availableVoices[0].lang);
      return availableVoices[0];
    }

    console.warn('No voices available at all!');
    return null;
  }, [availableVoices]);

  const speak = useCallback((text: string, overrideLanguage?: string) => {
    if (!speechRef.current || !text.trim()) return;

    // Check if speech synthesis is working at all
    if (!('speechSynthesis' in window)) {
      console.error('Speech Synthesis API not supported in this browser');
      return;
    }

    // Force reload voices if none are available
    if (availableVoices.length === 0) {
      console.warn('No voices available, forcing reload...');
      const voices = speechRef.current.getVoices();
      console.log('Force reload found', voices.length, 'voices');
      setAvailableVoices(voices);
      
      if (voices.length === 0) {
        console.error('No voices available even after force reload. Speech will not work.');
        console.error('Please check:');
        console.error('1. Browser supports Speech Synthesis');
        console.error('2. System has TTS voices installed');
        console.error('3. Browser permissions allow audio');
        
        // Try to speak anyway with system default
        console.log('Attempting speech with system default voice...');
      }
    }

    // Cancel any ongoing speech
    speechRef.current.cancel();

    // Use override language or current locale
    const targetLanguage = overrideLanguage || locale;

    let textToSpeak = text;
    let actualLanguage = targetLanguage;

    // For Telugu, check if we have a native Telugu voice
    if (targetLanguage === 'te') {
      const teluguVoice = getBestVoice('te');
      if (!teluguVoice || (!teluguVoice.lang.includes('te') && !teluguVoice.name.toLowerCase().includes('telugu'))) {
        // No native Telugu voice found, use transliteration
        console.log('No Telugu voice available, using phonetic transliteration');
        textToSpeak = transliterateTeluguToPhonetic(text);
        actualLanguage = 'en'; // Use English for transliterated text
      }
    }

    // Create new utterance
    utteranceRef.current = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set appropriate voice for the language
    const bestVoice = getBestVoice(actualLanguage);
    if (bestVoice) {
      utteranceRef.current.voice = bestVoice;
      console.log(`Selected voice for ${targetLanguage} (using ${actualLanguage}):`, bestVoice.name, bestVoice.lang);
    } else {
      console.warn(`No suitable voice found for language: ${actualLanguage}`);
      // For Telugu, if no voice found, try to use system default with transliteration
      if (targetLanguage === 'te') {
        console.log('Using system default voice with Telugu transliteration');
      }
    }

    // Set language-specific speech parameters with enhanced Telugu support
    const langCodes = LANGUAGE_VOICE_MAP[actualLanguage as SupportedLanguage];
    utteranceRef.current.lang = langCodes?.[0] || actualLanguage;
    
    // Adjust speech parameters for optimal pronunciation
    switch (targetLanguage) {
      case 'hi':
        utteranceRef.current.rate = 0.9; // Slightly slower for Hindi
        utteranceRef.current.pitch = 1.1;
        utteranceRef.current.volume = 0.9;
        break;
      case 'te':
        // Telugu settings - optimized for both native and transliterated speech
        if (actualLanguage === 'en') {
          // Transliterated Telugu - much slower and clearer
          console.log('Using optimized English speech for transliterated Telugu');
          utteranceRef.current.rate = 0.6;    // Very slow for clarity
          utteranceRef.current.pitch = 0.9;   // Slightly lower pitch
          utteranceRef.current.volume = 0.95; // Louder for clarity
        } else {
          // Native Telugu voice settings
          utteranceRef.current.rate = 0.8;    // Slower for Telugu
          utteranceRef.current.pitch = 1.0;   // Normal pitch
          utteranceRef.current.volume = 0.9;  // Slightly louder
        }
        break;
      default: // English
        utteranceRef.current.rate = 1.0;
        utteranceRef.current.pitch = 1.0;
        utteranceRef.current.volume = 0.8;
        break;
    }

    // Add enhanced error handling with better Telugu fallback
    utteranceRef.current.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error, 'for target language:', targetLanguage);
      
      if (targetLanguage === 'te') {
        if (actualLanguage === 'en') {
          console.warn('Telugu transliteration speech failed. Trying with different English voice...');
          // Try with a different English voice
          setTimeout(() => {
            const voices = speechRef.current?.getVoices() || [];
            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            const fallbackVoice = englishVoices.find(v => v.name !== bestVoice?.name) || englishVoices[0];
            
            if (fallbackVoice) {
              const retryUtterance = new SpeechSynthesisUtterance(textToSpeak);
              retryUtterance.voice = fallbackVoice;
              retryUtterance.rate = 0.5; // Very slow
              retryUtterance.pitch = 0.9;
              retryUtterance.volume = 1.0;
              retryUtterance.lang = 'en-US';
              console.log('Retrying with voice:', fallbackVoice.name);
              speechRef.current?.speak(retryUtterance);
            }
          }, 200);
        } else {
          console.warn('Native Telugu speech failed. Switching to transliteration fallback...');
          // Fallback to transliteration with English
          setTimeout(() => {
            const transliteratedText = transliterateTeluguToPhonetic(text);
            const fallbackUtterance = new SpeechSynthesisUtterance(transliteratedText);
            const englishVoice = getBestVoice('en');
            if (englishVoice) fallbackUtterance.voice = englishVoice;
            fallbackUtterance.lang = 'en-US';
            fallbackUtterance.rate = 0.6;
            fallbackUtterance.pitch = 0.9;
            fallbackUtterance.volume = 0.95;
            console.log('Speaking Telugu via transliteration:', transliteratedText);
            speechRef.current?.speak(fallbackUtterance);
          }, 200);
        }
      }
    };

    utteranceRef.current.onend = () => {
      // Clean up when speech ends
      console.log(`Speech synthesis completed for language: ${targetLanguage}`);
    };

    utteranceRef.current.onstart = () => {
      console.log(`Speech synthesis started for language: ${targetLanguage}`);
      if (targetLanguage === 'te' && actualLanguage === 'en') {
        console.log('Speaking transliterated Telugu text in English');
      }
    };

    try {
      // Speak the text
      speechRef.current.speak(utteranceRef.current);
      console.log(`Attempting to speak: "${textToSpeak.substring(0, 50)}..." in language: ${actualLanguage} (original: ${targetLanguage})`);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      if (targetLanguage === 'te') {
        console.error('Telugu speech synthesis failed completely. Trying fallback transliteration...');
        // Last resort: try transliteration with default system voice
        const transliteratedText = transliterateTeluguToPhonetic(text);
        setTimeout(() => {
          try {
            const fallbackUtterance = new SpeechSynthesisUtterance(transliteratedText);
            fallbackUtterance.rate = 0.7;
            speechRef.current?.speak(fallbackUtterance);
          } catch (fallbackError) {
            console.error('Even fallback transliteration failed:', fallbackError);
          }
        }, 100);
      }
    }
  }, [locale, getBestVoice, availableVoices.length]);

  const stop = useCallback(() => {
    if (speechRef.current) {
      speechRef.current.cancel();
    }
  }, []);

  // Get available voices for debugging/info
  const getAvailableVoices = useCallback(() => {
    return availableVoices;
  }, [availableVoices]);

  // Check if speech is supported
  const isSupported = useCallback(() => {
    return 'speechSynthesis' in window;
  }, []);

  // Debug function to get Telugu-specific voices
  const getTeluguVoices = useCallback(() => {
    const teluguVoices = availableVoices.filter(voice => 
      voice.lang.toLowerCase().includes('te') || 
      voice.name.toLowerCase().includes('telugu') ||
      voice.lang.toLowerCase() === 'te-in'
    );
    console.log('Telugu voices found:', teluguVoices.map(v => ({ name: v.name, lang: v.lang, localService: v.localService })));
    return teluguVoices;
  }, [availableVoices]);

  // Debug function to log all available voices
  const debugVoices = useCallback(() => {
    console.log('All available voices:', availableVoices.map(v => ({ 
      name: v.name, 
      lang: v.lang, 
      localService: v.localService,
      default: v.default 
    })));
  }, [availableVoices]);

  return { 
    speak, 
    stop, 
    getAvailableVoices, 
    isSupported,
    currentLanguage: locale,
    getTeluguVoices,
    debugVoices
  };
};