import React, { createContext, useContext, useState, useCallback } from 'react';

interface SpeechSettingsContextType {
  isSpeechEnabled: boolean;
  toggleSpeech: () => void;
  setSpeechEnabled: (enabled: boolean) => void;
}

const SpeechSettingsContext = createContext<SpeechSettingsContextType | undefined>(undefined);

export const SpeechSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize speech as enabled by default, but check localStorage for user preference
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(() => {
    const saved = localStorage.getItem('speechEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Default to enabled
  });

  const setSpeechEnabled = useCallback((enabled: boolean) => {
    setIsSpeechEnabled(enabled);
    localStorage.setItem('speechEnabled', JSON.stringify(enabled));
    console.log(`🎙️ Speech globally ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  const toggleSpeech = useCallback(() => {
    setSpeechEnabled(!isSpeechEnabled);
  }, [isSpeechEnabled, setSpeechEnabled]);

  const value: SpeechSettingsContextType = {
    isSpeechEnabled,
    toggleSpeech,
    setSpeechEnabled
  };

  return (
    <SpeechSettingsContext.Provider value={value}>
      {children}
    </SpeechSettingsContext.Provider>
  );
};

export const useSpeechSettings = (): SpeechSettingsContextType => {
  const context = useContext(SpeechSettingsContext);
  if (context === undefined) {
    throw new Error('useSpeechSettings must be used within a SpeechSettingsProvider');
  }
  return context;
};
