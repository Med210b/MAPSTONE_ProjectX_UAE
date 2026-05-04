import React, { useState } from 'react';
import { X, MapPin, Building2, Calendar, CheckCircle2, Navigation, ExternalLink, ShieldCheck, FileDown, Ruler, Share2, Bed, LayoutGrid } from 'lucide-react';
import { Project } from '../../data/projects';
import { motion, AnimatePresence } from 'motion/react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { getProjectGalleryUrls, getProjectImageUrl } from '../../lib/projectUtils';
import { CylinderCarousel3D } from './CylinderCarousel3D';

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
  onDownloadPdf?: (project: Project) => void;
}

export function ProjectDetails({ project, onClose, onDownloadPdf }: ProjectDetailsProps) {
  const mainImage = project.imageUrl && (project.imageUrl.startsWith('http') || project.imageUrl.startsWith('/'))
    ? project.imageUrl 
    : getProjectImageUrl(project.name);
    
  const { formatPrice, formatArea, currency, setCurrency } = usePreferences();
  
  const baseGallery = [
    mainImage,
    ...(project.galleryUrls || []),
    ...getProjectGalleryUrls(project.name, mainImage, 8)
  ];
    
  const gallery = Array.from(new Set(baseGallery.filter(img => img && img.trim() !== '')));

  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 lg:p-12"
    >
      {/* Immersive Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url('${mainImage}')` }}
      />
      <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl" />

      <motion.div 
        layoutId={`project-card-${project.id}`}
        className="w-full h-full max-w-7xl bg-[#0A1A2F]/90 backdrop-blur-2xl rounded-none md:rounded-[40px] border-0 md:border md:border-brand-gold/10 overflow-hidden flex flex-col md:flex-row relative shadow-2xl"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2.5 sm:p-3 bg-brand-gold text-brand-blue-dark rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-[120] border-2 sm:border-4 border-[#02060D]"
        >
          <X size={20} />
        </button>

        {/* Left Side: 3D Showcase (Hero Area) */}
        <div className="w-full md:w-3/5 lg:w-2/3 h-[400px] sm:h-[450px] md:h-full bg-transparent relative shrink-0 flex items-center justify-center p-2 order-1 md:order-none">
          <CylinderCarousel3D 
            images={gallery} 
            className="w-full h-full bg-transparent border-0"
            onImageClick={(url) => setActiveFullscreenImage(url)}
            onActiveIndexChange={setActiveImageIndex}
          />
          
          {/* Subtle Project Info - Desktop only, moved to top to avoid overlap with carousel center */}
          <div className="absolute top-8 left-8 hidden lg:block pointer-events-none z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <h1 className="text-4xl lg:text-6xl luxury-heading mb-2">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 text-brand-gold/60 text-xs font-bold uppercase tracking-[0.4em]">
                <MapPin className="w-4 h-4" />
                {project.area} • {project.emirate}
              </div>
            </motion.div>
          </div>

          {/* Action Buttons - Download & Share */}
          <div className="absolute top-8 left-8 md:left-auto md:right-12 z-20 flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => downloadImage(gallery[activeImageIndex], `${project.name}-${activeImageIndex + 1}.jpg`)}
              className="w-12 h-12 md:w-14 md:h-14 bg-brand-gold text-brand-black rounded-full shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:bg-white transition-all flex items-center justify-center group"
              title="Download Current Photo"
            >
              <FileDown size={22} className="group-hover:scale-110 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: project.name,
                    text: `Check out ${project.name} in ${project.area}`,
                    url: window.location.href
                  }).catch(() => window.open(window.location.href, '_blank'));
                } else {
                  window.open(window.location.href, '_blank');
                }
              }}
              className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md text-white rounded-full shadow-2xl hover:bg-brand-gold hover:text-brand-black transition-all flex items-center justify-center group border border-white/10"
              title="Share Project"
            >
              <Share2 size={22} className="group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>
        </div>

        {/* Right Side: Information Panel */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-[#0A1A2F]/95 md:bg-[#02060D]/40 border-l border-brand-gold/5 p-4 sm:p-8 lg:p-12">
          <div className="space-y-6 sm:space-y-8 max-w-lg mx-auto">
            {/* Header Info (Mobile/Tablet) */}
            <div className="lg:hidden">
              <h1 className="text-2xl sm:text-5xl luxury-heading mb-1 sm:mb-3">
                {project.name}
              </h1>
              <div className="flex items-center gap-1.5 text-brand-gold text-[10px] sm:text-sm font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4">
                <MapPin size={12} className="sm:w-4 sm:h-4" />
                {project.area}, {project.emirate}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="p-2.5 sm:p-7 bg-[#152A47]/40 rounded-[1.5rem] sm:rounded-[2rem] border border-brand-gold/10 group hover:border-brand-gold/50 transition-all duration-500 overflow-hidden min-w-0 flex flex-col justify-center">
                <p className="text-[7px] sm:text-[10px] text-brand-gold/40 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 sm:mb-3 leading-none">Price Range</p>
                <div className="flex items-center min-w-0">
                  <p className="text-[8px] xs:text-[10px] sm:text-lg font-black text-brand-gold tracking-tight whitespace-nowrap overflow-visible leading-tight">
                    {project.priceAED ? formatPrice(project.priceAED) : project.startingPrice}
                  </p>
                </div>
              </div>
              <div className="p-3.5 sm:p-7 bg-[#152A47]/40 rounded-[1.5rem] sm:rounded-[2rem] border border-brand-gold/10 group hover:border-brand-gold/50 transition-all duration-500 overflow-hidden min-w-0">
                <p className="text-[8px] sm:text-[10px] text-brand-gold/40 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3 leading-none">Handover</p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-gold" />
                  <p className="text-[10px] sm:text-base font-black text-[#EDEDED] uppercase">{project.handover}</p>
                </div>
              </div>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
               {project.totalAreaSqFt && (
                 <div className="flex items-center gap-3 p-3.5 bg-[#152A47]/40 rounded-xl border border-brand-gold/10">
                    <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg border border-brand-gold/20">
                      <Ruler size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] text-brand-gold/40 font-bold uppercase tracking-widest leading-none mb-1">Total Space</p>
                      <p className="text-xs font-black text-[#EDEDED]">{formatArea(project.totalAreaSqFt)}</p>
                    </div>
                 </div>
               )}
               {project.paymentPlan && (
                 <div className="flex items-center gap-3 p-3.5 bg-[#152A47]/40 rounded-xl border border-brand-gold/10">
                    <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg border border-brand-gold/20">
                      <LayoutGrid size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] text-brand-gold/40 font-bold uppercase tracking-widest leading-none mb-1">Payment Plan</p>
                      <p className="text-xs font-black text-[#EDEDED]">{project.paymentPlan}</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Description Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] font-heading">The Opportunity</h3>
              <p className="text-[#EDEDED] text-[13px] sm:text-base leading-relaxed font-normal italic opacity-90">
                {project.description}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 pb-20 md:pb-0">
              {onDownloadPdf && (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDownloadPdf(project)}
                  className="w-full p-4 sm:p-5 luxury-button-primary rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 shadow-xl text-[10px] sm:text-xs"
                >
                  <FileDown size={18} />
                  GENERATE PDF PORTFOLIO
                </motion.button>
              )}
              
              <div className="flex gap-3 sm:gap-4">
                <a 
                  href={`https://wa.me/971524316000?text=I am interested in ${project.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 p-4 sm:p-5 bg-[#152A47]/40 text-brand-gold border border-brand-gold/20 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] text-center hover:bg-brand-gold/10 hover:border-brand-gold/50 transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
                >
                  CONTACT ADVISOR
                </a>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}?project=${project.id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: project.name,
                        text: `Reviewing ${project.name} - Dubai Luxury Real Estate`,
                        url: url
                      }).catch(() => window.open(url, '_blank'));
                    } else {
                      window.open(url, '_blank');
                    }
                  }}
                  className="p-4 sm:p-5 bg-[#152A47]/40 text-brand-gold border border-brand-gold/20 rounded-xl sm:rounded-2xl hover:bg-brand-gold/10 hover:border-brand-gold/50 transition-all shadow-lg group"
                  title="Share Asset"
                >
                  <Share2 size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
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
            />
            <div className="absolute top-8 right-8 text-white/40 flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Click anywhere to close</span>
              <X size={24} className="hover:text-white transition-colors cursor-pointer" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
