import React from 'react';
import { usePreferences, Currency, UnitSystem } from '../../contexts/PreferencesContext';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Ruler } from 'lucide-react';

export const PreferenceSelector: React.FC = () => {
  const { currency, unitSystem, setCurrency, setUnitSystem } = usePreferences();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2.5 bg-[#152A47]/40 border border-brand-gold/20 rounded-xl hover:border-brand-gold/50 transition-all text-xs font-bold text-[#EDEDED]"
      >
        <span>{currency}</span>
        <span className="w-px h-3 bg-brand-gold/30 mx-2" />
        <span>{unitSystem === 'sqft' ? 'Sq/ft' : 'Sq/m'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-56 bg-[#0A1A2F] border border-brand-gold/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 p-5 backdrop-blur-xl"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 text-brand-gold mb-3 px-1">
                  <Globe size={14} />
                  <span className="text-[10px] luxury-heading !text-transparent !bg-clip-text">Currency</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['AED', 'USD', 'EUR'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        currency === c 
                          ? 'bg-brand-gold text-brand-black' 
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-brand-gold mb-3 px-1">
                  <Ruler size={14} />
                  <span className="text-[10px] luxury-heading !text-transparent !bg-clip-text">Units</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUnitSystem('sqft')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      unitSystem === 'sqft' 
                        ? 'bg-brand-gold text-brand-black' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    Sq/ft
                  </button>
                  <button
                    onClick={() => setUnitSystem('sqm')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      unitSystem === 'sqm' 
                        ? 'bg-brand-gold text-brand-black' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    Sq/m
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
