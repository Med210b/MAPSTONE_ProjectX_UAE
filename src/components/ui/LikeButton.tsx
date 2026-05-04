import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  liked: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  liked, 
  onClick, 
  className = "", 
  size = 20 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.8 }}
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 overflow-hidden shadow-xl ${
        liked 
          ? 'bg-pink-500/10 border-pink-500/30 text-pink-500' 
          : 'bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/20'
      } ${className}`}
      style={{ padding: size / 2 }}
    >
      <AnimatePresence>
        {liked && (
          <motion.div 
            initial={{ scale: 0, opacity: 1 }} 
            animate={{ scale: 2.5, opacity: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut" }} 
            className="absolute inset-0 bg-pink-500 rounded-full pointer-events-none z-0" 
          />
        )}
      </AnimatePresence>
      <Heart 
        size={size} 
        className={`transition-colors duration-300 relative z-10 ${
          liked ? 'fill-pink-500' : 'fill-transparent'
        }`} 
        strokeWidth={2.5}
      />
    </motion.button>
  );
};
