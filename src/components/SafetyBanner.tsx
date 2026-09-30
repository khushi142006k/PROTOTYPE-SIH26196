import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../translations';

interface SafetyBannerProps {
  language: Language;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ language }) => {
  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 px-4 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-medium">{getTranslation(language, 'safetyDisclaimer')}</span>
      </div>
      <span className="hidden md:inline-block font-mono text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap font-semibold">
        Safety First
      </span>
    </div>
  );
};
