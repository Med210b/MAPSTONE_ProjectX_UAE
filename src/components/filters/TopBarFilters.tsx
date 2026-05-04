import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CylinderMenu } from '../ui/CylinderMenu';
import { EMIRATES, EMIRATE_AREAS, Emirate } from '../../data/projects';

interface FiltersProps {
  selectedEmirate: string;
  onEmirateSelect: (emirate: string) => void;
  selectedAreas: string[];
  onAreaToggle: (area: string) => void;
}

export function TopBarFilters({ selectedEmirate, onEmirateSelect, selectedAreas, onAreaToggle }: FiltersProps) {
  const emirateItems = ['All', ...EMIRATES];

  return (
    <div className="w-full space-y-4 pb-4 select-none">
      {/* 3D Cylinder Menu Replacement */}
      <div className="w-full mb-6">
        <CylinderMenu 
          items={emirateItems}
          selectedItem={selectedEmirate}
          onSelect={onEmirateSelect}
          title="Region Selection"
        />
      </div>

      {/* Area Sub-filters */}
      <AnimatePresence>
        {selectedEmirate !== 'All' && EMIRATE_AREAS[selectedEmirate as Emirate] && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar py-2 snap-x">
              {EMIRATE_AREAS[selectedEmirate as Emirate].map((area) => {
                const isSelected = selectedAreas.includes(area) || (area === 'All Areas' && selectedAreas.length === 0);
                return (
                  <button
                    key={area}
                    onClick={() => onAreaToggle(area)}
                    className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all snap-start border ${
                      isSelected
                        ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/40 shadow-[0_0_15px_rgba(200,169,106,0.3)]'
                        : 'bg-[#152A47]/40 text-[#EDEDED]/40 border-white/5 hover:border-brand-gold/30 hover:text-white/70 backdrop-blur-md shadow-sm'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
