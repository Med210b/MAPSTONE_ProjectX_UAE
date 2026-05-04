import React from 'react';
import { motion } from 'motion/react';

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const GlowingBorder: React.FC<GlowingBorderProps> = ({ 
  children, 
  className = "",
  glowColor = "#C5A059" 
}) => {
  return (
    <div className={`relative p-[1.5px] overflow-hidden rounded-[2.5rem] group ${className}`}>
      {/* The spinning conic gradient layer */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-[-100%] z-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, transparent 40%, ${glowColor} 50%, transparent 60%, transparent 100%)`,
        }}
      />
      
      {/* The content container with mask background */}
      <div className="relative z-10 w-full h-full bg-[#0b101b] rounded-[2.4rem] overflow-hidden">
        {children}
      </div>
    </div>
  );
};
