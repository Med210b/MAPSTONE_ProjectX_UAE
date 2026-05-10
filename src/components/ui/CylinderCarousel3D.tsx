import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Image as ImageIcon, Maximize2 } from 'lucide-react';

interface CylinderCarousel3DProps {
  images: string[];
  className?: string;
  onImageClick?: (url: string) => void;
  onActiveIndexChange?: (index: number) => void;
}

export function CylinderCarousel3D({ images, className = "", onImageClick, onActiveIndexChange }: CylinderCarousel3DProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [validImages, setValidImages] = useState<string[]>(images);

  useEffect(() => {
    const initialFiltered = images.filter(img =>
      img &&
      img.trim() !== '' &&
      !img.includes('undefined') &&
      !img.includes('null') &&
      (img.startsWith('http') || img.startsWith('/'))
    );
    setValidImages(initialFiltered.length > 0 ? initialFiltered : images.slice(0, 1));
  }, [images]);

  // Limit items to 4 to guarantee it never clips outside the mobile QuickView container
  const displayImages = validImages.slice(0, 4);

  const toggleMenu = () => setIsOpen(!isOpen);

  // We build the menu items from the bottom up to properly nest them in 3D space
  let nestedItems: React.ReactNode = null;

  for (let i = displayImages.length - 1; i >= 0; i--) {
    const img = displayImages[i];
    const isLast = i === displayImages.length - 1;

    nestedItems = (
      <motion.div
        initial={false}
        animate={{
          rotateX: isOpen ? 0 : -90,
          opacity: isOpen ? 1 : 0
        }}
        transition={{
          duration: 0.5,
          type: "spring",
          bounce: 0, // Zero bounce keeps the folding strictly mechanical and clean
          delay: isOpen ? (i * 0.1) : ((displayImages.length - i - 1) * 0.05)
        }}
        style={{
          transformOrigin: "top",
          transformStyle: "preserve-3d",
          // Micro-overlap to prevent browser sub-pixel rendering gaps
          marginTop: i === 0 ? '0px' : '-1px'
        }}
        className="absolute top-full left-0 w-full"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.(img);
            onActiveIndexChange?.(i);
          }}
          className={`w-full h-[60px] sm:h-[70px] bg-[#12223A] border-x border-b border-brand-gold/20 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] relative group cursor-pointer overflow-hidden ${isLast ? 'rounded-b-[1.5rem]' : ''}`}
        >
          {/* Background Image Slice */}
          <img src={img} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" alt={`Gallery ${i + 1}`} />

          {/* Gradient Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A2F]/90 via-[#0A1A2F]/60 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-60" />

          {/* Option Label */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col">
            <span className="text-brand-gold font-black text-xs sm:text-sm tracking-[0.2em] uppercase drop-shadow-md">Photo 0{i + 1}</span>
          </div>

          {/* Interactive Hover Icon */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <div className="p-1.5 sm:p-2 bg-brand-gold/90 backdrop-blur-md rounded-full shadow-lg">
              <Maximize2 size={14} className="text-[#0A1A2F] font-black sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>
        
        {/* The child nested inside its parent creates the accordion hinge */}
        {nestedItems}
      </motion.div>
    );
  }

  return (
    <div
      className={`relative w-full h-[400px] md:h-full flex items-start justify-center pt-10 sm:pt-16 overflow-visible ${className}`}
      style={{ perspective: "1500px" }}
    >
      {/* Main Trigger Header */}
      <div className="relative w-[280px] sm:w-[340px] z-50" style={{ transformStyle: "preserve-3d" }}>
        <div
          onClick={toggleMenu}
          className={`w-full h-[70px] sm:h-[80px] bg-gradient-to-r from-brand-gold to-brand-gold/80 shadow-[0_15px_30px_-5px_rgba(197,160,89,0.3)] relative cursor-pointer flex items-center justify-between px-6 sm:px-8 transition-all duration-300 ${isOpen ? 'rounded-t-[1.5rem]' : 'rounded-[1.5rem]'}`}
        >
          <div className="flex items-center gap-4">
            <ImageIcon size={22} className="text-[#0A1A2F]" />
            <div className="flex flex-col">
              <span className="text-[#0A1A2F] font-black uppercase tracking-[0.2em] text-sm sm:text-base leading-none mb-1">Gallery Menu</span>
              <span className="text-[#0A1A2F]/70 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase leading-none">{displayImages.length} Options</span>
            </div>
          </div>
          <motion.div
            animate={{ rotateX: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            className="p-1.5 sm:p-2 bg-[#0A1A2F]/10 rounded-full text-[#0A1A2F]"
          >
            <ChevronDown size={20} className="sm:w-6 sm:h-6" />
          </motion.div>
        </div>

        {/* Render the fully nested 3D fold-out sequence */}
        {nestedItems}
      </div>
    </div>
  );
}