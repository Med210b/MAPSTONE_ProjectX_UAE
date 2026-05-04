import React, { useState, useMemo } from 'react';
import { X, MapPin, Building2, Calendar, Ruler, CreditCard, ChevronRight, Heart, FileDown } from 'lucide-react';
import { Project } from '../../data/projects';
import { motion, AnimatePresence } from 'motion/react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useAuth } from '../../contexts/AuthContext';
import { LikeButton } from './LikeButton';
import { GlowingBorder } from './GlowingBorder';
import { getProjectImageUrl, getProjectGalleryUrls } from '../../lib/projectUtils';
import { CylinderCarousel3D } from './CylinderCarousel3D';

interface QuickViewProps {
  project: Project | null;
  onClose: () => void;
  onViewFullDetails: (project: Project) => void;
}

export const QuickView: React.FC<QuickViewProps> = ({ project, onClose, onViewFullDetails }) => {
  const { formatPrice, formatArea, currency, setCurrency } = usePreferences();
  const { user, appUser, toggleFavorite } = useAuth();
  const [activeFullscreenImage, setActiveFullscreenImage] = useState<string | null>(null);

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { referrerPolicy: 'no-referrer' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      window.open(url, '_blank');
    }
  };

  // FIX: Memoize images here too
  const mainImage = useMemo(() => {
    if (!project) return '';
    return project.imageUrl && (project.imageUrl.startsWith('http') || project.imageUrl.startsWith('/'))
      ? project.imageUrl 
      : getProjectImageUrl(project.name);
  }, [project]);
  
  const gallery = useMemo(() => {
    if (!project) return [];
    const baseGallery = [
      mainImage,
      ...(project.galleryUrls || []),
      ...getProjectGalleryUrls(project.name, mainImage, 8)
    ];
    return Array.from(new Set(baseGallery.filter(img => img && img.trim() !== '')));
  }, [project, mainImage]);

  if (!project) return null;
  const isFavorite = appUser?.favorites?.includes(project.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0A1A2F]/95 backdrop-blur-2xl border border-brand-gold/20 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col md:flex-row overflow-y-auto md:overflow-visible max-h-[90vh] md:max-h-none scrollbar-hide overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-40 p-2.5 bg-brand-gold text-brand-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
          >
            <X size={20} />
          </button>

          {/* Left: 3D Showcase Section */}
          <div className="w-full md:w-1/2 h-[400px] md:h-auto relative shrink-0 overflow-hidden flex items-center justify-center p-4 bg-black/20">
            <CylinderCarousel3D 
              images={gallery} 
              className="w-full h-full"
              onImageClick={(url) => setActiveFullscreenImage(url)}
              onActiveIndexChange={(index) => {
                (window as any)._activeQuickViewImage = index;
              }}
            />
            
            {/* Quick Download Button for active image */}
            <div className="absolute top-6 left-6 z-20">
              <button 
                onClick={() => {
                  const idx = (window as any)._activeQuickViewImage || 0;
                  downloadImage(gallery[idx], `${project.name}-${idx + 1}.jpg`);
                }}
                className="p-3 bg-brand-gold/10 backdrop-blur-md text-brand-gold border border-brand-gold/40 rounded-xl shadow-xl hover:bg-brand-gold hover:text-brand-black transition-all"
                title="Download current photo"
              >
                <FileDown size={18} />
              </button>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A2F] via-transparent to-transparent md:bg-gradient-to-r pointer-events-none" />
          </div>

          {/* Right: Content Section */}
          <div className="w-full md:w-1/2 p-5 md:p-14 flex flex-col h-full bg-[#152A47]/30">
            <div className="mb-4 md:mb-10">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                  Premier Project
                </span>
              </div>
              
              <h2 className="text-xl md:text-4xl leading-tight mb-1 md:mb-2 luxury-heading">{project.name}</h2>
              <div className="flex items-center text-[#EDEDED]/50 gap-1.5 mb-4 md:mb-6">
                <MapPin size={10} className="md:w-3.5 md:h-3.5 text-brand-gold" />
                <span className="text-[9px] md:text-sm font-medium uppercase tracking-widest">{project.area}, {project.emirate}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-8 mb-4 md:mb-12">
                <div className="p-2 sm:p-3 md:p-6 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 relative group/price overflow-hidden min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-0.5 md:mb-2">
                    <p className="text-[7px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#EDEDED]/30 font-black">Price Range</p>
                  </div>
                  <div className="flex items-center min-w-0">
                    <p className="text-[8px] xs:text-[9.5px] sm:text-xs md:text-xl luxury-heading leading-tight whitespace-nowrap overflow-visible">
                      {project.priceAED ? formatPrice(project.priceAED) : project.startingPrice}
                    </p>
                  </div>
                </div>
                <div className="p-2.5 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                  <p className="text-[7px] md:text-[10px] uppercase tracking-widest text-white/30 mb-0.5 md:mb-1 font-black">Beds</p>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Building2 size={12} className="md:w-3.5 md:h-3.5 text-brand-gold" />
                    <p className="text-[10px] md:text-lg font-black text-white">{project.beds}</p>
                  </div>
                </div>
                <div className="p-2.5 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                  <p className="text-[7px] md:text-[10px] uppercase tracking-widest text-white/30 mb-0.5 md:mb-1 font-black">Handover</p>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Calendar size={12} className="md:w-3.5 md:h-3.5 text-brand-gold" />
                    <p className="text-[10px] md:text-lg font-black text-white whitespace-nowrap overflow-hidden text-ellipsis">{project.handover}</p>
                  </div>
                </div>
                {project.totalAreaSqFt && (
                  <div className="p-2.5 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                    <p className="text-[7px] md:text-[10px] uppercase tracking-widest text-white/30 mb-0.5 md:mb-1 font-black">Area</p>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Ruler size={12} className="md:w-3.5 md:h-3.5 text-brand-gold" />
                      <p className="text-[10px] md:text-lg font-black text-white">{formatArea(project.totalAreaSqFt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {project.paymentPlan && (
                <div className="mb-4 md:mb-8 p-2.5 md:p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-[1rem] md:rounded-2xl flex items-center gap-2.5 md:gap-4">
                  <div className="w-7 h-7 md:w-10 md:h-10 bg-brand-gold/20 rounded-lg md:rounded-xl flex items-center justify-center text-brand-gold shrink-0">
                    <CreditCard size={14} className="md:w-5 md:h-5 text-brand-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-brand-gold/60 leading-none mb-1">Acquisition</p>
                    <p className="text-[10px] md:text-lg font-black text-white leading-none truncate">{project.paymentPlan}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto flex gap-2 sm:gap-3 pb-2 md:pb-0">
              <button 
                onClick={() => onViewFullDetails(project)}
                className="flex-1 bg-brand-gold hover:bg-white text-brand-black px-4 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-xs transition-all flex items-center justify-center gap-2"
              >
                More <ChevronRight size={14} />
              </button>
              
              {user && (
                <div className="relative">
                  <LikeButton 
                    liked={!!isFavorite}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(project.id);
                    }}
                    size={16}
                    className="w-10 h-10 md:w-[52px] md:h-[52px]"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Fullscreen Image Overlay (Lightbox) */}
        <AnimatePresence>
          {activeFullscreenImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFullscreenImage(null)}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={activeFullscreenImage} 
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                alt="Fullscreen view"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute top-8 right-8 text-white/40 flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Click anywhere to close</span>
                <X size={24} className="hover:text-white transition-colors cursor-pointer" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};