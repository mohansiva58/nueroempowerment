import React, { useState, useRef } from 'react';
import { useSpeech } from './Voice';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpeechSettings } from '../contexts/SpeechSettingsContext';

interface SpeechTextProps {
  children: React.ReactNode;
  className?: string;
  overrideLanguage?: string;
  enableVisualFeedback?: boolean;
}

export const SpeechText: React.FC<SpeechTextProps> = ({ 
  children, 
  className = '', 
  overrideLanguage,
  enableVisualFeedback = true 
}) => {
  const { speak, stop, isSupported } = useSpeech();
  const { locale } = useLanguage();
  const { isSpeechEnabled } = useSpeechSettings();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isSupported()) return;
    
    setIsHovered(true);
    const text = e.currentTarget.textContent;
    if (text) {
      // Small delay to prevent accidental triggers, but fast enough for responsive interaction
      hoverTimeoutRef.current = setTimeout(() => {
        speak(text, overrideLanguage || locale);
      }, 150); // Reduced from potential longer delays
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    stop();
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isSupported()) return;
    
    // Immediate speech on click for better responsiveness
    const text = e.currentTarget.textContent;
    if (text) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      speak(text, overrideLanguage || locale);
    }
  };

  // Don't add interactive behavior if speech is not supported or disabled
  if (!isSupported() || !isSpeechEnabled) {
    const disabledStyles = !isSpeechEnabled ? 'opacity-60' : '';
    return <span className={`${className} ${disabledStyles}`}>{children}</span>;
  }

  // Visual feedback styles based on language and state
  const getLanguageSpecificStyles = () => {
    const currentLang = overrideLanguage || locale;
    let langStyles = '';
    
    switch (currentLang) {
      case 'hi':
        langStyles = 'hover:bg-orange-50 hover:border-orange-200';
        break;
      case 'te':
        langStyles = 'hover:bg-blue-50 hover:border-blue-200';
        break;
      default: // English
        langStyles = 'hover:bg-green-50 hover:border-green-200';
        break;
    }
    
    return langStyles;
  };

  const feedbackStyles = enableVisualFeedback 
    ? `cursor-pointer transition-all duration-200 ${getLanguageSpecificStyles()} ${
        isHovered 
          ? 'shadow-sm border border-opacity-30 rounded-sm px-1' 
          : 'hover:text-blue-600'
      }`
    : 'cursor-pointer hover:text-blue-600 transition-colors';

  return (
    <span
      className={`${feedbackStyles} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={`Click to hear in ${overrideLanguage || locale === 'en' ? 'English' : locale === 'hi' ? 'Hindi' : 'Telugu'}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const syntheticEvent = {
            currentTarget: e.currentTarget
          } as React.MouseEvent<HTMLSpanElement>;
          handleClick(syntheticEvent);
        }
        if (e.key === 'Escape') {
          handleMouseLeave();
        }
      }}
    >
      {children}
      {enableVisualFeedback && isHovered && (
        <span className="ml-1 text-xs opacity-50">
          {locale === 'hi' ? '🔊' : locale === 'te' ? '🔊' : '🔊'}
        </span>
      )}
    </span>
  );
};