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
  // THE FIX: Cranked stiffness to 500 for lightning-fast, snappy rotation
  const springX = useSpring(x, { stiffness: 500, damping: 40 });
  const rotationY = useTransform(springX, (val) => `${val}deg`);

  const [radius, setRadius] = useState(400);
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
      
      if (width < 640) {
        const itemWidth = 260; 
        setRadius(Math.max(350, (itemWidth / 2) / Math.tan(Math.PI / itemCount) + 40)); 
        setContainerHeight(540); 
      } else if (width < 1024) {
        const itemWidth = 320; 
        setRadius(Math.max(450, (itemWidth / 2) / Math.tan(Math.PI / itemCount) + 50));
        setContainerHeight(Math.min(height * 0.6, 540));
      } else {
        const itemWidth = 400; 
        setRadius(Math.max(500, (itemWidth / 2) / Math.tan(Math.PI / itemCount) + 60));
        setContainerHeight(Math.min(height * 0.8, 650));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [itemCount]);

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
        perspective: "1200px",
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
          z: -radius, 
          transformStyle: "preserve-3d" 
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          // THE FIX: Lowered velocity threshold to 150. A tiny, fast flick will now instantly change the slide.
          const isFar = Math.abs(info.offset.x) > 30;
          
          if (info.velocity.x > 150 || (isFar && info.offset.x > 0)) {
             handlePrev();
          } else if (info.velocity.x < -150 || (isFar && info.offset.x < 0)) {
             handleNext();
          } else {
             rotateTo(rotationIndex); 
          }
        }}
        className="relative w-[260px] h-[380px] sm:w-[320px] sm:h-[450px] md:w-[400px] md:h-[500px] cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {displayImages.map((img, i) => {
          const isFront = i === currentIndex;
          
          return (
            <motion.div 
              key={`${img}-${i}`} 
              className="absolute inset-0 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-brand-gold/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] bg-[#0A1A2F] group"
              style={{ 
                transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
              // Removed individual card spring physics that were fighting the main container physics
            >
              <div 
                className="w-full h-full relative cursor-pointer bg-[#0A1A2F]"
                onClick={() => isFront && onImageClick?.(img)}
              >
                <img 
                  src={img} 
                  alt={`Project ${i + 1}`} 
                  referrerPolicy="no-referrer"
                  onError={() => handleImageError(img)}
                  // THE FIX: Changed duration-700 to duration-300 so the visual focus effect matches the fast swipe
                  className={`w-full h-full object-cover transition-all duration-300 ${isFront ? 'opacity-100 scale-100 blur-0' : 'opacity-10 scale-95 blur-[2px] grayscale-[60%]'}`} 
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

      <div 
        className="absolute bottom-4 sm:bottom-6 flex gap-4 z-[100]"
        style={{ transform: "translateZ(150px)" }}
      >
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="p-3 sm:p-4 bg-[#152A47]/80 backdrop-blur-xl rounded-full text-brand-gold border border-brand-gold/30 hover:border-brand-gold transition-all shadow-2xl pointer-events-auto"
        >
          <ChevronLeft size={20} className="sm:w-[28px] sm:h-[28px]" />
        </motion.button>
        
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 bg-[#152A47]/80 backdrop-blur-xl rounded-full border border-brand-gold/20 shadow-2xl pointer-events-auto">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); handleDotClick(i); }}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-brand-gold w-4 sm:w-6 shadow-[0_0_8px_rgba(200,169,106,0.5)]' : 'bg-brand-gold/30'}`}
            />
          ))}
        </div>
 
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="p-3 sm:p-4 bg-[#152A47]/80 backdrop-blur-xl rounded-full text-brand-gold border border-brand-gold/30 hover:border-brand-gold transition-all shadow-2xl pointer-events-auto"
        >
          <ChevronRight size={20} className="sm:w-[28px] sm:h-[28px]" />
        </motion.button>
      </div>

      <div className="absolute inset-y-0 left-0 w-8 sm:w-32 bg-gradient-to-r from-[#0A1A2F] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-32 bg-gradient-to-l from-[#0A1A2F] to-transparent pointer-events-none z-10" />
    </div>
  );
}