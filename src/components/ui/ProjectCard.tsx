import React from 'react';
import { MapPin, Calendar, Building2, Navigation, BadgeCheck, Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Project } from '../../data/projects';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../contexts/AuthContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { DeveloperLogo } from './DeveloperLogo';
import { LikeButton } from './LikeButton';
import { GlowingBorder } from './GlowingBorder';
import { getProjectImageUrl } from '../../lib/projectUtils';

interface ProjectCardProps {
  project: Project;
  onViewOnMap: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  onQuickView?: (project: Project) => void;
  onSelect?: (project: Project) => void;
  isSelected?: boolean;
  showSelect?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewOnMap, onViewDetails, onQuickView, onSelect, isSelected, showSelect }) => {
  const { developers } = useData();
  const { user, appUser, toggleFavorite } = useAuth();
  const { formatPrice } = usePreferences();

  const isFavorite = appUser?.favorites?.includes(project.id);
  const mainImage = project.imageUrl && (project.imageUrl.startsWith('http') || project.imageUrl.startsWith('/'))
    ? project.imageUrl 
    : getProjectImageUrl(project.name);

  const developerData = developers.find(d => 
    d.name.toLowerCase() === project.developer.toLowerCase() || 
    project.developer.toLowerCase().includes(d.name.toLowerCase())
  );

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return; // Should show some login prompt if needed, but for now just guard
    await toggleFavorite(project.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative h-full flex flex-col luxury-card ${isSelected ? 'ring-2 ring-brand-gold shadow-[0_0_20px_rgba(200,169,106,0.3)]' : 'border border-white/5'} overflow-hidden hover:border-brand-gold/30 transition-all cursor-pointer`}
      onClick={() => {
         if (showSelect && onSelect) {
           onSelect(project);
         } else if (onQuickView) {
           onQuickView(project);
         } else if (onViewDetails) {
           onViewDetails(project);
         }
      }}
    >
        {showSelect && (
         <div className="absolute top-4 left-4 z-10 w-8 h-8 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
           onClick={(e) => {
             e.stopPropagation();
             if (onSelect) onSelect(project);
           }}
         >
           {isSelected && <div className="w-4 h-4 bg-brand-gold rounded-md" />}
         </div>
      )}
      {/* Image with zoom effect */}
      <div className="h-44 md:h-56 overflow-hidden relative">
        <div 
          className="absolute inset-0 bg-gray-900 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110" 
          style={{ backgroundImage: `url('${mainImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
        
        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(project);
            }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl"
          >
            <Eye size={12} className="md:w-[14px] text-brand-gold" />
            Quick View
          </motion.button>
        </div>
        
        {user && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
            <LikeButton 
              liked={!!isFavorite}
              onClick={handleToggleFavorite}
              size={16}
              className="w-8 h-8 md:w-10 md:h-10"
            />
          </div>
        )}
      </div>
      
      <div className="p-3 md:p-6">
        <div className="flex justify-between items-start mb-1.5 md:mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
              <h4 className="font-bold text-sm md:text-lg text-white group-hover:text-brand-gold transition-colors truncate">{project.name}</h4>
              {project.isVerifiedAgent && (
                <div className="flex-shrink-0" title="Verified Agent Handling Project">
                   <BadgeCheck className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-blue-400 fill-blue-400/10" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-2 py-0.5 md:px-2.5 md:py-1.5 rounded-xl border border-white/5 w-fit">
              {developerData && (
                 <div className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-white flex items-center justify-center p-[1px] md:p-[2px] overflow-hidden shadow-lg">
                   <DeveloperLogo 
                     name={developerData.name} 
                     logoUrl={developerData.logoUrl} 
                     className="w-full h-full object-contain"
                   />
                 </div>
              )}
              <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.05em] md:tracking-[0.1em] text-white/50">{project.developer}</p>
            </div>
          </div>
          <span className="text-[7px] md:text-[10px] px-1.5 py-0.5 md:px-2.5 md:py-1.5 bg-brand-gold text-brand-blue-dark rounded-lg font-black tracking-wider uppercase ml-2 md:ml-3 shadow-lg whitespace-nowrap">{project.handover}</span>
        </div>
        
        <div className="flex items-center text-[9px] md:text-xs text-white/40 mb-1.5 md:mb-3 font-medium">
          <MapPin size={10} className="md:w-3.5 md:h-3.5 mr-1.5 md:mr-2 text-brand-gold" />
          <span className="truncate">{project.area}, {project.emirate}</span>
        </div>

        {project.description && (
          <p className="text-white/50 text-[9px] md:text-[11px] leading-relaxed mb-3 md:mb-5 line-clamp-2 h-7 md:h-8">
            {project.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-6 pt-2 md:pt-4 border-t border-white/5 bg-white/[0.02] -mx-3 md:-mx-6 px-3 md:px-6 py-2 md:py-4">
          <div className="flex items-center text-white/60 text-[8px] md:text-[11px] font-bold uppercase tracking-wider">
            <Building2 size={12} className="md:w-4 md:h-4 mr-1.5 md:mr-2.5 text-brand-gold/40" />
            {project.beds}
          </div>
          <div className="flex items-center text-white/60 text-[8px] md:text-[11px] font-bold uppercase tracking-wider">
            <Calendar size={12} className="md:w-4 md:h-4 mr-1.5 md:mr-2.5 text-brand-gold/40" />
            <span className="truncate">{project.handover}</span>
          </div>
        </div>

        <div className="flex justify-between items-end w-full gap-2 pt-0.5">
          <div className="min-w-0">
            <p className="text-[7px] md:text-[9px] font-black uppercase text-[#EDEDED]/30 tracking-[0.15em] md:tracking-[0.2em] mb-1 leading-none">Starting From</p>
            <p className="text-sm md:text-lg luxury-heading leading-none truncate">
              {project.priceAED ? formatPrice(project.priceAED) : project.startingPrice}
            </p>
          </div>
          <div>
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={(e) => {
                 e.stopPropagation();
                 onViewOnMap(project);
               }}
               className="px-4 md:px-7 py-2 md:py-3.5 luxury-button-primary rounded-xl md:rounded-2xl text-[8px] md:text-[11px]"
             >
               Explore
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
