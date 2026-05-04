import { motion } from 'motion/react';

export const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "linear-gradient(-45deg, #02060D, #0A1A2F, #152A47, #02060D)",
          backgroundSize: "450% 450%",
          filter: "blur(120px)",
        }}
      />
      <div className="absolute inset-0 bg-brand-black/20 backdrop-blur-3xl" />
    </div>
  );
};
