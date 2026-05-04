import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/w40/ae.png' },
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
  { code: 'it', name: 'Italiano', flag: 'https://flagcdn.com/w40/it.png' },
  { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/w40/ru.png' },
  { code: 'zh-CN', name: '中文', flag: 'https://flagcdn.com/w40/cn.png' },
  { code: 'tr', name: 'Türkçe', flag: 'https://flagcdn.com/w40/tr.png' },
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // Load saved preference
  useEffect(() => {
    // Check if google sets a cookie
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match && match[2]) {
      const parts = match[2].split('/');
      if (parts.length > 2) {
        let code = parts[2];
        if (code === 'zh-CN') code = 'zh-CN';
        if (LANGUAGES.find(l => l.code === code)) {
          setCurrentLang(code);
        }
      }
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Attempt to use Google Translate combo box directly
    const changeEvent = new Event('change', { bubbles: true });
    let combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(changeEvent);
    } else {
      // If combo box is not ready or failed, fallback to setting cookie and reloading
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      window.location.reload();
    }
  };

  const selectedLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#152A47]/40 hover:bg-[#152A47]/60 border border-brand-gold/20 transition-all shadow-sm"
      >
        <img src={selectedLanguage.flag} alt={selectedLanguage.name} className="w-5 h-auto rounded-[2px] no-invert border border-white/10" />
        <span className="text-sm font-bold hidden md:block text-[#EDEDED] tracking-wide">
          {selectedLanguage.code.toUpperCase()}
        </span>
        <ChevronDown size={14} className="text-brand-gold/70" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-56 bg-[#0A1A2F] backdrop-blur-2xl border border-brand-gold/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden p-2"
            >
              <div className="py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-brand-gold/10 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={lang.flag} alt={lang.name} className="w-6 h-auto rounded-[2px] no-invert shadow-sm group-hover:scale-110 transition-transform" />
                      <span className="text-[#EDEDED]/80 group-hover:text-[#EDEDED]">{lang.name}</span>
                    </div>
                    {currentLang === lang.code && (
                      <Check size={16} className="text-brand-gold" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
