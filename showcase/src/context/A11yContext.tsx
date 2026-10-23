import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ScreenReaderType, SpeechLog } from '../types';

interface A11yContextType {
  isRemediated: boolean;
  setIsRemediated: (val: boolean) => void;
  activeScreenReader: ScreenReaderType;
  setActiveScreenReader: (sr: ScreenReaderType) => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  speechLogs: SpeechLog[];
  speak: (text: string, category?: SpeechLog['category']) => void;
  clearSpeechLogs: () => void;
  livePoliteMessage: string;
  setLivePoliteMessage: (msg: string) => void;
  liveAssertiveMessage: string;
  setLiveAssertiveMessage: (msg: string) => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const A11yProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRemediated, setIsRemediated] = useState<boolean>(true);
  const [activeScreenReader, setActiveScreenReader] = useState<ScreenReaderType>('voiceover');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [speechLogs, setSpeechLogs] = useState<SpeechLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      text: 'VoiceOver on macOS / Safari initialized. Web Rotor active.',
      srType: 'voiceover',
      category: 'announcement',
    },
  ]);
  const [livePoliteMessage, setLivePoliteMessage] = useState<string>('');
  const [liveAssertiveMessage, setLiveAssertiveMessage] = useState<string>('');

  const speak = useCallback(
    (text: string, category: SpeechLog['category'] = 'focus') => {
      const newLog: SpeechLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        text,
        srType: activeScreenReader,
        category,
      };
      setSpeechLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    [activeScreenReader]
  );

  const clearSpeechLogs = useCallback(() => {
    setSpeechLogs([]);
  }, []);

  return (
    <A11yContext.Provider
      value={{
        isRemediated,
        setIsRemediated,
        activeScreenReader,
        setActiveScreenReader,
        isHighContrast,
        setIsHighContrast,
        speechLogs,
        speak,
        clearSpeechLogs,
        livePoliteMessage,
        setLivePoliteMessage,
        liveAssertiveMessage,
        setLiveAssertiveMessage,
      }}
    >
      <div className={isHighContrast ? 'high-contrast-mode' : ''}>
        {children}
        {/* Real hidden live regions for actual screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {livePoliteMessage}
        </div>
        <div aria-live="assertive" aria-atomic="true" className="sr-only">
          {liveAssertiveMessage}
        </div>
      </div>
    </A11yContext.Provider>
  );
};

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};
