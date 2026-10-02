import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeModeSelectProps {
  compact?: boolean;
  id?: string;
}

export const ThemeModeSelect: React.FC<ThemeModeSelectProps> = ({ compact = false, id }) => {
  const { themePreference, setTheme } = useTheme();
  const ModeIcon = themePreference === 'system' ? Monitor : themePreference === 'dark' ? Moon : Sun;

  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
      <ModeIcon size={15} aria-hidden="true" />
      {!compact && <span className="hidden sm:inline">Tema</span>}
      <select
        id={id}
        aria-label="Tema tampilan"
        value={themePreference}
        onChange={event => setTheme(event.target.value as 'system' | 'light' | 'dark')}
        className="max-w-28 rounded-lg border border-stone-700 bg-stone-900 px-2 py-1.5 text-xs text-zinc-200 outline-none transition-colors hover:border-stone-600 focus:border-orange-500"
      >
        <option value="system">Sistem</option>
        <option value="light">Terang</option>
        <option value="dark">Gelap</option>
      </select>
    </label>
  );
};
