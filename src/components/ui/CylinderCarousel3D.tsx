import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface CylinderCarousel3DProps {
  images: string[];
  className?: string;
  onImageClick?: (url: string) => void;
  onActiveIndexChange?: (index: number) => void;
}

export function CylinderCarousel3D({ images, className = "", onImageClick, onActiveIndexChange }: CylinderCarousel3DProps) {
  const [rotationIndex, setRotationIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [validImages, setValidImages] = useState<string[]>(images);
  
  const displayImages = validImages.filter(img => 
    img && 
    img.trim() !== '' && 
    !img.includes('undefined') && 
    !img.includes('null') &&
    (img.startsWith('http') || img.startsWith('/'))
  ).slice(0, 12);
  
  const itemCount = Math.max(displayImages.length, 1);
  const angleStep = 360 / itemCount;

  const currentIndex = ((rotationIndex % itemCount) + itemCount) % itemCount;

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 30 });
  const rotationY = useTransform(springX, (val) => `${val}deg`);

  const [radius, setRadius] = useState(250);
  const [containerHeight, setContainerHeight] = useState(500);
  
  useEffect(() => {
    const initialFiltered = images.filter(img => 
      img && 
      img.trim() !== '' && 
      !img.includes('undefined') && 
      !img.includes('null') &&
      (img.startsWith('http') || img.startsWith('/'))
    );
    setValidImages(initialFiltered.length > 0 ? initialFiltered : images.slice(0, 1));
    setRotationIndex(0);
    if (x) x.set(0);
  }, [images]);

  const handleImageError = (imgUrl: string) => {
    setValidImages(prev => prev.filter(url => url !== imgUrl));
  };

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // FIX: Increased radius and height for mobile to support larger images
      if (width < 640) {
        setRadius(170); 
        setContainerHeight(460); 
      } else if (width < 1024) {
        setRadius(240);
        setContainerHeight(Math.min(height * 0.6, 500));
      } else {
        setRadius(Math.min(width * 0.3, 450));
        setContainerHeight(Math.min(height * 0.8, 650));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const rotateTo = (newRotationIndex: number) => {
    setRotationIndex(newRotationIndex);
    const safeIndex = ((newRotationIndex % itemCount) + itemCount) % itemCount;
    onActiveIndexChange?.(safeIndex);
    x.set(-newRotationIndex * angleStep);
  };

  const handleNext = () => rotateTo(rotationIndex + 1);
  const handlePrev = () => rotateTo(rotationIndex - 1);

  const handleDotClick = (targetIndex: number) => {
    const diff = targetIndex - currentIndex;
    rotateTo(rotationIndex + diff);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-transparent via-black/10 to-black/30 rounded-3xl ${className}`} 
      style={{ 
        perspective: "1500px",
        height: `${containerHeight}px`
      }}
    >
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="w-[1000px] h-[500px] bg-brand-gold/5 blur-[150px] rounded-full rotate-45 transform -translate-y-1/2" />
        <div className="w-[800px] h-[400px] bg-brand-gold/5 blur-[100px] rounded-full -rotate-12 transform translate-y-1/2" />
      </div>

      <motion.div 
        style={{ 
          rotateY: rotationY,
          transformStyle: "preserve-3d" 
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          const threshold = 50;
          if (info.offset.x > threshold) handlePrev();
          else if (info.offset.x < -threshold) handleNext();
          else rotateTo(rotationIndex); 
        }}
        // FIX: Changed mobile sizes from w-32/h-240px to w-56/h-360px for a massive full-size look
        className="relative w-56 h-[360px] sm:w-64 sm:h-[400px] md:w-80 md:h-[480px] cursor-grab active:cursor-grabbing"
      >
        {displayImages.map((img, i) => {
          const isFront = i === currentIndex;
          
          return (
            <motion.div 
              key={`${img}-${i}`} 
              className="absolute inset-0 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-brand-gold/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] bg-[#0A1A2F] group"
              style={{ 
                transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
              whileHover={isFront ? { scale: 1.02 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div 
                className="w-full h-full relative cursor-pointer"
                onClick={() => isFront && onImageClick?.(img)}
              >
                <img 
                  src={img} 
                  alt={`Project ${i + 1}`} 
                  referrerPolicy="no-referrer"
                  onError={() => handleImageError(img)}
                  className={`w-full h-full object-cover transition-all duration-700 ${isFront ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale-[30%]'}`} 
                />
                
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/10 via-transparent to-transparent opacity-40 pointer-events-none" />
                
                {isFront && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#0A1A2F]/60 backdrop-blur-[4px]">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-5 luxury-button-primary rounded-full shadow-2xl pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick?.(img);
                      }}
                    >
                      <Maximize2 className="w-8 h-8 font-black" />
                    </motion.div>
                  </div>
                )}
              </div>

              <div 
                className="absolute top-[102%] left-0 right-0 h-full opacity-20 pointer-events-none"
                style={{ 
                  transform: 'scaleY(-1)',
                  maskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent 30%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent 30%)'
                }}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="absolute bottom-6 flex gap-4 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev} 
          className="p-3 sm:p-4 bg-[#152A47]/40 backdrop-blur-xl rounded-full text-brand-gold border border-brand-gold/20 hover:border-brand-gold transition-all shadow-xl"
        >
          <ChevronLeft size={20} className="sm:w-[28px] sm:h-[28px]" />
        </motion.button>
        
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 bg-[#152A47]/40 backdrop-blur-md rounded-full border border-brand-gold/10">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-brand-gold w-3 sm:w-4 shadow-[0_0_8px_rgba(200,169,106,0.5)]' : 'bg-brand-gold/20'}`}
            />
          ))}
        </div>
 
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext} 
          className="p-3 sm:p-4 bg-[#152A47]/40 backdrop-blur-xl rounded-full text-brand-gold border border-brand-gold/20 hover:border-brand-gold transition-all shadow-xl"
        >
          <ChevronRight size={20} className="sm:w-[28px] sm:h-[28px]" />
        </motion.button>
      </div>

      <div className="absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-10" />
    </div>
  );
}