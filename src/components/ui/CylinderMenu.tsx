import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface CylinderMenuProps {
  items: string[];
  selectedItem: string;
  onSelect: (item: string) => void;
  title: string;
}

export const CylinderMenu = ({ items, selectedItem, onSelect, title }: CylinderMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: string) => {
    onSelect(item);
    setIsOpen(false);
  };

  // Build the 3D fold-out sequence recursively from the bottom up
  let nestedItems: React.ReactNode = null;

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    const isSelected = item === selectedItem;
    const isLast = i === items.length - 1;

    nestedItems = (
      <motion.div
        initial={false}
        animate={{
          rotateX: isOpen ? 0 : -90,
          opacity: isOpen ? 1 : 0
        }}
        transition={{
          duration: 0.4,
          type: "spring",
          bounce: 0, // 0 bounce ensures a clean, mechanical folding effect
          delay: isOpen ? i * 0.06 : (items.length - i - 1) * 0.04
        }}
        style={{
          transformOrigin: "top",
          transformStyle: "preserve-3d",
          // -1px margin prevents sub-pixel gaps between folded elements
          marginTop: i === 0 ? '0px' : '-1px'
        }}
        className="absolute top-full left-0 w-full z-50"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(item);
          }}
          className={`w-full h-[60px] md:h-[70px] bg-[#0A1A2F]/95 backdrop-blur-xl border-x border-b border-brand-gold/20 flex items-center justify-between px-6 cursor-pointer hover:bg-[#152A47] transition-colors shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] ${
            isLast ? 'rounded-b-[1.5rem]' : ''
          }`}
        >
          <span
            className={`text-xs md:text-sm font-black uppercase tracking-[0.25em] transition-colors ${
              isSelected ? 'text-brand-gold drop-shadow-md' : 'text-white/60 group-hover:text-white'
            }`}
          >
            {item === 'All' ? 'All UAE' : item}
          </span>
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(197,160,89,0.8)]" />
          )}
        </div>

        {/* Recursively insert the next child inside this one to create the continuous hinge */}
        {nestedItems}
      </motion.div>
    );
  }

  return (
    // FIX: Added a dynamic z-index (z-[200] when open, z-20 when closed) to force the menu to overlay the List/Map toggle
    <div className={`relative w-full transition-all duration-300 ${isOpen ? 'z-[200]' : 'z-20'}`}>
      
      {/* Invisible backdrop to close the menu when clicking outside */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100]" // No background color, just catches clicks
          />
        )}
      </AnimatePresence>

      {/* Main 3D Container */}
      <div 
        className="relative w-full z-[101]" 
        style={{ perspective: "1500px" }}
      >
        <div className="relative w-full" style={{ transformStyle: "preserve-3d" }}>
          
          {/* Main Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full group relative flex items-center justify-between px-4 md:px-6 py-4 md:py-5 bg-[#0A1A2F]/95 backdrop-blur-xl border border-brand-gold/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 ${
              isOpen ? 'rounded-t-[1.5rem] border-b-brand-gold/10' : 'rounded-[1.5rem] hover:border-brand-gold/40'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/[0.05] to-transparent pointer-events-none rounded-inherit"></div>
            
            <div className="flex items-center gap-3 md:gap-4 relative z-10">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 flex items-center justify-center text-brand-gold border border-brand-gold/20">
                <span className="text-xl md:text-2xl filter drop-shadow-sm">
                  {selectedItem === 'All' ? '🇦🇪' : '📍'}
                </span>
              </div>
              <div className="flex flex-col items-start translate-y-0.5">
                <span className="text-[9px] md:text-[10px] text-brand-gold/60 uppercase tracking-[0.3em] font-bold leading-none mb-1.5">
                  {title}
                </span>
                <span className="text-sm md:text-lg luxury-heading leading-tight text-white">
                  {selectedItem === 'All' ? 'All UAE' : selectedItem}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 relative z-10">
              <div className="h-6 md:h-8 w-[1px] bg-white/10 mx-1"></div>
              <motion.div
                animate={{ rotateX: isOpen ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <ChevronDown className="text-brand-gold/80 w-5 h-5 md:w-6 md:h-6" />
              </motion.div>
            </div>
          </button>

          {/* Render the fully nested 3D fold-out sequence */}
          {nestedItems}
          
        </div>
      </div>
    </div>
  );
};