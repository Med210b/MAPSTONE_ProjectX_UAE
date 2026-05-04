import React, { useState, useEffect } from 'react';

interface DeveloperLogoProps {
  name: string;
  logoUrl?: string; // Keep for interface compatibility but ignored for now
  className?: string;
}

export function DeveloperLogo({ name, logoUrl, className = "" }: DeveloperLogoProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (logoUrl && logoUrl.trim() !== "") {
      setSrc(logoUrl);
      setIsError(false);
    } else {
      // If no URL at all, we show initials immediately
      setSrc(null);
      setIsError(true);
    }
  }, [name, logoUrl]);

  const handleError = () => {
    console.warn(`Logo failed to load for: ${name}. Falling back to initials.`);
    setIsError(true);
    setSrc(null);
  };

  if (isError || !src) {
    return (
      <div className={`${className} bg-white flex items-center justify-center text-[10px] font-bold text-brand-gold uppercase tracking-tighter overflow-hidden border border-brand-gold/20 rounded-full h-full w-full aspect-square shadow-inner`}>
        {name.substring(0, 2)}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name} 
      className={`${className} transition-opacity duration-300 opacity-100 object-contain`}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
}
