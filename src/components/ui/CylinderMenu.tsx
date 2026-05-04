import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X } from 'lucide-react';

interface CylinderMenuProps {
  items: string[];
  selectedItem: string;
  onSelect: (item: string) => void;
  title: string;
}

export const CylinderMenu = ({ items, selectedItem, onSelect, title }: CylinderMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const radius = 80; // Distance from center
  const angleStep = 360 / items.length;

  // Find index of selected item for initial positioning
  const selectedIndex = items.indexOf(selectedItem);
  const [rotation, setRotation] = useState(-selectedIndex * angleStep);

  useEffect(() => {
    const idx = items.indexOf(selectedItem);
    if (idx !== -1) {
      setRotation(-idx * angleStep);
    }
  }, [selectedItem, items, angleStep]);

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group relative flex items-center justify-between px-4 md:px-6 py-4 md:py-5 rounded-2xl transition-all duration-500 bg-[#0A1A2F]/80 backdrop-blur-xl border border-brand-gold/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-brand-gold/30 active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/[0.05] to-transparent pointer-events-none rounded-2xl"></div>
        
        <div className="flex items-center gap-3 md:gap-4 relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 flex items-center justify-center text-brand-gold border border-brand-gold/20">
            <span className="text-xl md:text-2xl filter drop-shadow-sm">
              {selectedItem === 'All' ? '🇦🇪' : '📍'}
            </span>
          </div>
          <div className="flex flex-col items-start translate-y-0.5">
            <span className="text-[9px] md:text-[10px] text-brand-gold/60 uppercase tracking-[0.3em] font-bold leading-none mb-1.5">Region</span>
            <span className="text-sm md:text-lg luxury-heading leading-tight">
              {selectedItem === 'All' ? 'All UAE' : selectedItem}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 relative z-10">
          <div className="h-6 md:h-8 w-[1px] bg-white/5 mx-1"></div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <ChevronDown className="text-brand-gold/80 w-5 h-5 md:w-6 md:h-6" />
          </motion.div>
        </div>
      </button>

      {/* 3D Cylinder Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 z-[101] bg-brand-black border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden"
              style={{ perspective: "2000px" }}
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                 <h3 className="text-[9px] md:text-xs font-black text-brand-gold/60 uppercase tracking-[0.3em]">{title}</h3>
                 <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
                    <X size={16} />
                 </button>
              </div>

              <div className="relative h-64 md:h-72 w-full flex items-center justify-center">
                {/* Center Highlight */}
                <div className="absolute inset-x-0 h-14 md:h-16 border-y border-white/10 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none z-0" />
                
                <motion.div
                  className="relative w-full h-12 md:h-14 z-10"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateX: [0, -360] }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  {items.map((item, i) => {
                    const isSelected = item === selectedItem;
                    const angle = i * angleStep;
                    
                    return (
                      <div
                        key={item}
                        onClick={() => {
                          onSelect(item);
                          setIsOpen(false);
                        }}
                        className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-all duration-300 rounded-lg md:rounded-xl border ${
                          isSelected 
                            ? 'bg-brand-gold text-brand-black border-brand-gold shadow-[0_0_50px_rgba(197,160,89,0.3)] scale-110 z-20' 
                            : 'bg-[#1a2333]/60 border-white/5 text-white/30 hover:text-white/80 hover:bg-white/10 hover:border-white/20'
                        }`}
                        style={{ 
                          transform: `rotateX(${angle}deg) translateZ(100px)`, // Reduced Z for better fit on small screens
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d"
                        }}
                      >
                        <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] pointer-events-none" style={{ transform: "translateZ(1px)" }}>
                          {item === 'All' ? 'All UAE' : item}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Instructions */}
              <div className="mt-6 md:mt-8 text-center">
                 <p className="text-[8px] md:text-[10px] text-white/20 font-medium uppercase tracking-widest">
                    Select a region to explore premium listings
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
