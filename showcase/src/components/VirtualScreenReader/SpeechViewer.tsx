import React, { useState } from 'react';
import { useA11y } from '../../context/A11yContext';
import { Volume2, Trash2, Laptop, Monitor, ChevronUp, ChevronDown } from 'lucide-react';

export const SpeechViewer: React.FC = () => {
  const { speechLogs, clearSpeechLogs, activeScreenReader, setActiveScreenReader } = useA11y();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  return (
    <aside
      aria-label="Assistive Technology Speech Viewer"
      className="fixed bottom-4 right-4 z-50 w-96 rounded-xl border border-[#3b3d45] bg-[#181b1f]/95 shadow-2xl backdrop-blur-md transition-all duration-200"
    >
      <div className="flex items-center justify-between border-b border-[#2c3036] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-[#5794f2]" aria-hidden="true" />
          <h2 className="text-xs font-semibold tracking-wider text-gray-200 uppercase">
            Speech Viewer
          </h2>
          <span className="rounded bg-[#22252b] px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
            {activeScreenReader === 'voiceover' ? 'macOS VoiceOver' : 'Windows NVDA'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveScreenReader(activeScreenReader === 'voiceover' ? 'nvda' : 'voiceover')}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-300 hover:bg-[#2c3036] hover:text-white transition"
            title={`Switch to ${activeScreenReader === 'voiceover' ? 'NVDA' : 'VoiceOver'}`}
            aria-label={`Switch screen reader profile to ${activeScreenReader === 'voiceover' ? 'NVDA' : 'VoiceOver'}`}
          >
            {activeScreenReader === 'voiceover' ? (
              <Laptop className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
            ) : (
              <Monitor className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
            )}
            <span className="text-[11px] font-medium">
              {activeScreenReader === 'voiceover' ? 'VO' : 'NVDA'}
            </span>
          </button>
          <button
            type="button"
            onClick={clearSpeechLogs}
            className="rounded p-1 text-gray-400 hover:bg-[#2c3036] hover:text-red-400 transition"
            title="Clear speech output logs"
            aria-label="Clear speech output logs"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 text-gray-400 hover:bg-[#2c3036] hover:text-white transition"
            title={isMinimized ? 'Expand speech viewer' : 'Minimize speech viewer'}
            aria-label={isMinimized ? 'Expand speech viewer' : 'Minimize speech viewer'}
          >
            {isMinimized ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3">
          <div
            tabIndex={0}
            role="region"
            aria-label="Screen reader announcement transcript history"
            className="h-48 overflow-y-auto rounded-lg bg-[#0d0e11] p-3 font-mono text-[11px] leading-relaxed border border-[#22252a] space-y-2 focus:ring-1 focus:ring-[#5794f2]"
          >
            {speechLogs.length === 0 ? (
              <p className="text-gray-500 italic">No speech announcements yet. Tab or click into components to inspect speech output.</p>
            ) : (
              speechLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border-l-2 pl-2 transition ${
                    log.category === 'announcement'
                      ? 'border-emerald-500 text-emerald-300'
                      : log.category === 'error'
                      ? 'border-rose-500 text-rose-300'
                      : log.category === 'action'
                      ? 'border-amber-500 text-amber-200'
                      : 'border-blue-500 text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="uppercase tracking-wider font-semibold">
                      {log.srType === 'voiceover' ? 'VO Caption' : 'NVDA Speech'} · {log.category}
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="mt-0.5 select-text font-medium text-white/90">
                    "{log.text}"
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Simulates OS Accessibility API speech buffer</span>
            <span className="text-[#5794f2]">WCAG 4.1.2 & 4.1.3 verified</span>
          </div>
        </div>
      )}
    </aside>
  );
};
