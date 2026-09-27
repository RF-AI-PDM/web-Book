import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, Coffee, Download, User, LogOut, Check, Copy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, theme, setTheme, fontSize, setFontSize } = useTheme();
  const { user, signIn, signOutUser } = useAuth();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isSettingsOpen) return null;

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const outcome = await installPrompt.userChoice;
      if (outcome.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } else {
      // Simulate or inform PWA installed
      setIsInstalled(true);
      setTimeout(() => setIsInstalled(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#15161c] border border-stone-700 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-6 animate-in fade-in zoom-in-95">
        {/* Header matching Screenshot 3 */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <h3 className="font-serif font-bold text-lg text-zinc-100">
            Pengaturan
          </h3>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ukuran Teks */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-300 block">
            Ukuran teks
          </label>
          <div className="grid grid-cols-3 gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setFontSize('small')}
              className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                fontSize === 'small'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kecil
            </button>
            <button
              onClick={() => setFontSize('standard')}
              className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                fontSize === 'standard'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Standar
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Besar
            </button>
          </div>
        </div>

        {/* Tema */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-300 block">
            Tema
          </label>
          <div className="grid grid-cols-3 gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setTheme('light')}
              className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                theme === 'light'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun size={13} />
              <span>Terang</span>
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                theme === 'sepia'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Coffee size={13} />
              <span>Sepia</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`py-2 px-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Moon size={13} />
              <span>Gelap</span>
            </button>
          </div>
        </div>

        {/* Install Aplikasi F15 */}
        <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-200">
              Install Aplikasi F15
            </p>
            <p className="text-[11px] text-zinc-400">
              Baca offline lebih cepat di layar utama.
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isInstalled ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
            <span>{isInstalled ? 'Terpasang' : 'Install'}</span>
          </button>
        </div>

        {/* Akun */}
        <div className="pt-2 border-t border-stone-800">
          <label className="text-xs font-semibold text-zinc-300 block mb-2">
            Akun
          </label>
          {user ? (
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-2">
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {user.displayName || 'Pengguna F15'}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
                  <span className="font-mono text-zinc-500">UID:</span>
                  <span className="font-mono text-orange-300 text-[9px] truncate max-w-[150px]">{user.uid}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.uid);
                      setCopiedUid(true);
                      setTimeout(() => setCopiedUid(false), 2000);
                    }}
                    className="p-1 text-zinc-400 hover:text-orange-400 rounded transition-colors cursor-pointer"
                    title="Salin UID ke clipboard"
                  >
                    {copiedUid ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <button
                onClick={signOutUser}
                className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                title="Keluar akun"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
