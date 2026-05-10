import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Project } from '../../data/projects';
import { AppUser } from '../../contexts/AuthContext';
import { BadgeCheck, MapPin, ShieldCheck, FileDown } from 'lucide-react';
import { LOGO_URL } from '../../App';
import { getProjectImageUrl } from '../../lib/projectUtils';

interface PdfGeneratorProps {
  projects: Project[];
  appUser: AppUser | null;
  onClose: () => void;
}

export function PdfGenerator({ projects, appUser, onClose }: PdfGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | null>(null);

  const generatePDF = async () => {
    let success = false;
    try {
      const target = pdfRef.current;
      if (!target) {
        setError('Reference to PDF content lost. Please try again.');
        return;
      }

      setError(null);
      setGenerating(true);
      // Generous pause for image assets to completely load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = await html2canvas(target, { 
        useCORS: true,
        backgroundColor: '#0b101b',
        logging: false, 
        scale: 2,
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          // 1. Defuse <style> tags to prevent the html2canvas parser from crashing on oklab/oklch
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styles.length; i++) {
            try {
              if (styles[i].innerHTML) {
                styles[i].innerHTML = styles[i].innerHTML
                  .replace(/oklab\([^)]+\)/g, 'transparent')
                  .replace(/oklch\([^)]+\)/g, 'transparent')
                  .replace(/color\([^)]+\)/g, 'transparent');
              }
            } catch(e) {
               console.warn("Failed to sanitize style tag", e);
            }
          }

          // 2. Ensure base wrapper colors are locked in
          const pdfContent = clonedDoc.getElementById('pdf-content-wrapper');
          if (pdfContent) {
            pdfContent.style.backgroundColor = '#0b101b';
            pdfContent.style.color = '#ffffff';
          }
        }
      });
      
      if (!canvas) throw new Error('Canvas generation failed');

      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Other pages
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const fileName = projects.length === 1 
        ? `${projects[0].name.replace(/\s+/g, '_')}_Brochure.pdf`
        : 'Property_Portfolio.pdf';

      pdf.save(fileName);
      success = true;
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setError(err?.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
      if (success) {
         setTimeout(() => onClose(), 1000); 
      }
    }
  };

  const isArabic = document.documentElement.lang === 'ar' || 
                   document.cookie.includes('googtrans=/en/ar') ||
                   document.body.dir === 'rtl';

  useEffect(() => {
    const timer = setTimeout(() => {
      generatePDF();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      {/* UI visible to the user (Safe to use normal Tailwind here) */}
      <div className="bg-[#0b101b] border border-white/10 p-8 rounded-[2.5rem] w-[95%] max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20 relative">
           <FileDown className="text-brand-gold animate-bounce" size={32} />
           <div className="absolute inset-0 border-2 border-brand-gold/30 rounded-2xl animate-ping opacity-20"></div>
        </div>
        <h3 className="text-2xl font-black text-white mb-2">{error ? 'Error Preparing PDF' : 'Preparing PDF'}</h3>
        <p className="text-white/50 mb-8 text-sm leading-relaxed px-4">
          {error 
            ? <span className="text-red-400">{error}</span>
            : (generating 
                ? "Rendering high-resolution images and agent profile..." 
                : "Your premium brochure is being prepared for instant download.")}
        </p>
        
        {generating && (
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-8">
             <motion.div 
               initial={{ width: "0%" }}
               animate={{ width: "95%" }}
               transition={{ duration: 8, ease: "linear" }}
               className="h-full bg-brand-gold shadow-[0_0_15px_rgba(197,160,89,0.5)]"
             />
          </div>
        )}

        <div className="flex flex-col gap-4">
          {error ? (
             <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              onClick={generatePDF} 
              className="w-full py-4 bg-brand-gold text-[#000000] rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_6px_0_0_rgb(157,120,49)] hover:shadow-[0_2px_0_0_rgb(157,120,49)]"
             >
                Try Again
             </motion.button>
          ) : (
            !generating && (
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                onClick={generatePDF} 
                className="w-full py-4 bg-brand-gold text-[#000000] rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_6px_0_0_rgb(157,120,49)] hover:shadow-[0_2px_0_0_rgb(157,120,49)]"
              >
                Download Now
              </motion.button>
            )
          )}
          <button onClick={onClose} className="w-full py-4 mt-2 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-white border border-white/10">
            {error ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>

      {/* Hidden PDF container - Using STRICT inline colors (hex/rgba) to prevent OKLAB crashes */}
      <div 
        className="fixed top-0 left-[-5000px] -z-50 pointer-events-none overflow-hidden" 
        style={{ 
          width: '1000px', 
          height: '1414px', 
          padding: '0', 
          direction: isArabic ? 'rtl' : 'ltr',
          fontFamily: isArabic ? '"Noto Sans Arabic", "Segoe UI Arabic", Tahoma, sans-serif' : '"Inter", sans-serif',
          letterSpacing: isArabic ? 'normal' : 'inherit',
          transform: 'scale(1)', 
          transformOrigin: 'top left',
          backgroundColor: '#0b101b',
          color: '#ffffff'
        }}
      >
         <div ref={pdfRef} id="pdf-content-wrapper" className="flex flex-col" style={{ width: '1000px', height: '1414px', backgroundColor: '#0b101b', color: '#ffffff' }}>
            
            {/* Header / Branding */}
            <div className={`px-[48px] py-[36px] flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} justify-between items-center`} style={{ backgroundColor: '#0b101b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <img src={LOGO_URL} alt="Logo" style={{ height: '70px', width: 'auto', maxWidth: '250px', objectFit: 'contain' }} crossOrigin="anonymous" />
               <div className={isArabic ? 'text-left' : 'text-right'}>
                 <h1 className="text-[28px] font-black uppercase tracking-tighter mb-[4px] leading-none" style={{ color: '#C5A059' }}>Estate Global</h1>
                 <p className="text-[11px] font-bold tracking-[0.2em] uppercase m-0 leading-none" style={{ color: 'rgba(255,255,255,0.4)' }}>Premium Real Estate Portfolio</p>
               </div>
            </div>

            {/* Projects Container */}
            <div className="flex-1 px-[48px] py-[36px] overflow-hidden">
               {projects.slice(0, 1).map((project, i) => {
                  const mainImage = project.imageUrl && project.imageUrl.startsWith('http') 
                    ? project.imageUrl 
                    : getProjectImageUrl(project.name);
                    
                  return (
                  <div key={i} className="rounded-[32px] h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#121a2d', border: '1px solid rgba(255,255,255,0.05)' }}>
                     {/* Hero Image */}
                     <div className="relative h-[440px] shrink-0">
                        <img src={mainImage} alt={project.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #121a2d, rgba(0,0,0,0.4), transparent)' }}></div>
                        <div className={`absolute bottom-[36px] ${isArabic ? 'right-[44px] text-right' : 'left-[44px]'}`}>
                           <h2 className="text-[52px] font-black mb-[10px] leading-none" style={{ color: '#ffffff' }}>{project.name}</h2>
                           <div className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''} font-bold uppercase tracking-widest text-[16px]`} style={{ color: '#C5A059' }}>
                              <MapPin size={20} className={isArabic ? 'ml-[8px]' : 'mr-[8px]'} />
                              {project.area}, {project.emirate}
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-[44px] flex-1 flex flex-col justify-between">
                        <div>
                           {/* Quick Stats Grid */}
                           <div className={`grid grid-cols-3 gap-[24px] mb-[40px] pb-[40px] ${isArabic ? 'text-right' : ''}`} style={{ direction: isArabic ? 'rtl' : 'ltr', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <div>
                                 <p className="text-[12px] uppercase tracking-[0.2em] mb-[10px] font-black" style={{ color: 'rgba(255,255,255,0.4)' }}>Developer</p>
                                 <p className="text-[22px] font-bold leading-tight truncate" style={{ color: '#ffffff' }}>{project.developer}</p>
                              </div>
                              <div>
                                 <p className="text-[12px] uppercase tracking-[0.2em] mb-[10px] font-black" style={{ color: 'rgba(255,255,255,0.4)' }}>Starting Price</p>
                                 <p className="text-[22px] font-bold leading-tight" style={{ color: '#C5A059' }}>{project.priceAED ? new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(project.priceAED) : project.startingPrice}</p>
                              </div>
                              <div>
                                 <p className="text-[12px] uppercase tracking-[0.2em] mb-[10px] font-black" style={{ color: 'rgba(255,255,255,0.4)' }}>Handover</p>
                                 <p className="text-[22px] font-bold uppercase leading-tight" style={{ color: '#ffffff' }}>{project.handover}</p>
                              </div>
                           </div>

                          {/* Content Split */}
                          <div className={`grid grid-cols-2 gap-[56px]`}>
                             <div className={isArabic ? 'order-2 text-right' : 'text-left'}>
                                <h3 className="font-black uppercase tracking-[0.2em] text-[12px] mb-[20px]" style={{ color: '#C5A059' }}>Project Masterplan</h3>
                                <p className={`text-[14px] leading-[1.7] ${isArabic ? 'text-right' : 'text-left'}`} style={{ color: 'rgba(255,255,255,0.7)' }}>
                                  {project.description}
                                </p>
                             </div>
                             <div className={isArabic ? 'order-1 text-right' : 'text-left'}>
                                <h3 className="font-black uppercase tracking-[0.2em] text-[12px] mb-[20px]" style={{ color: '#C5A059' }}>World-Class Amenities</h3>
                                <div className="grid grid-cols-2 gap-x-[20px] gap-y-[18px]">
                                  {project.amenities?.slice(0, 8).map(a => (
                                    <div key={a} className={`flex items-center gap-[12px] ${isArabic ? 'flex-row-reverse text-right' : ''} text-[13px] font-medium leading-snug`} style={{ color: 'rgba(255,255,255,0.8)' }}>
                                      <ShieldCheck size={16} className="shrink-0" style={{ color: '#C5A059' }} />
                                      <span>{a}</span>
                                    </div>
                                  ))}
                                </div>
                             </div>
                          </div>
                        </div>
                     </div>
                  </div>
                  );
               })}
            </div>

            {/* Premium Agent Bio */}
            {appUser && (
              <div className="mx-[48px] mb-[32px] p-[36px] rounded-[32px] relative overflow-hidden shrink-0" style={{ backgroundColor: '#121a2d', border: '1px solid rgba(197,160,89,0.2)' }}>
                 <div className="absolute -top-[60px] -right-[60px] w-[200px] h-[200px] rounded-full blur-[60px]" style={{ backgroundColor: 'rgba(197,160,89,0.05)' }}></div>
                 
                 <div className={`flex items-center ${isArabic ? 'flex-row-reverse text-right' : ''} gap-[36px] relative z-10`}>
                    
                    {/* Profile Image */}
                    <div className="relative shrink-0">
                       {appUser.photoURL ? (
                          <img src={appUser.photoURL || undefined} alt={appUser.displayName} className="w-[100px] h-[100px] rounded-[20px] object-cover" crossOrigin="anonymous" style={{ border: '2px solid #C5A059' }} />
                       ) : (
                          <div className="w-[100px] h-[100px] rounded-[20px] flex items-center justify-center text-[36px] font-black" style={{ border: '2px solid #C5A059', backgroundColor: '#000000', color: '#C5A059' }}>
                            {appUser.displayName.charAt(0)}
                          </div>
                       )}
                       <div className={`absolute -bottom-[10px] ${isArabic ? '-left-[10px]' : '-right-[10px]'} p-[6px] rounded-xl`} style={{ backgroundColor: '#3b82f6', color: '#ffffff', border: '3px solid #121a2d' }}>
                          <BadgeCheck size={20} strokeWidth={2.5} />
                       </div>
                    </div>
                    
                    {/* Agent Details */}
                    <div className="flex-1 min-w-0">
                       <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''} mb-[6px]`}>
                          <h3 className="text-[24px] font-black leading-none m-0 truncate pr-4" style={{ color: '#ffffff' }}>{appUser.displayName}</h3>
                          <span className="px-[14px] py-[6px] shrink-0 rounded-full text-[9px] font-black uppercase tracking-[0.1em]" style={{ backgroundColor: 'rgba(197,160,89,0.1)', color: '#C5A059', border: '1px solid rgba(197,160,89,0.2)' }}>
                             {isArabic ? 'شريك عقاري معتمد' : 'Verified Estates Partner'}
                          </span>
                       </div>
                       <p className="font-bold text-[11px] tracking-[0.2em] uppercase mb-[20px] leading-none" style={{ color: 'rgba(197,160,89,0.7)' }}>{appUser.companyName}</p>
                       
                       <div className={`grid grid-cols-2 gap-x-[24px] gap-y-[14px] pt-[20px] ${isArabic ? 'text-right' : ''}`} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          <div className={isArabic ? 'order-2' : ''}>
                             <p className="text-[10px] uppercase font-black mb-[6px] tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{isArabic ? 'اتصال مباشر' : 'Direct Contact'}</p>
                             <p className="text-[15px] font-bold leading-none m-0" style={{ color: '#ffffff' }}>{appUser.phoneNumber}</p>
                          </div>
                          <div className={isArabic ? 'order-1' : ''}>
                             <p className="text-[10px] uppercase font-black mb-[6px] tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{isArabic ? 'استعلام بالبريد' : 'Email Inquiry'}</p>
                             <p className="text-[15px] font-bold leading-none m-0 truncate" style={{ color: '#ffffff' }}>{appUser.email}</p>
                          </div>
                          <div className="col-span-2 flex justify-between items-end pt-[14px] mt-[4px]" style={{ color: 'rgba(197,160,89,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                             <p className="text-[11px] font-bold uppercase tracking-widest leading-none m-0">{appUser.reraNumber || 'PRP-20837 (APPLIED)'}</p>
                             <p className="text-[10px] italic m-0 font-medium">{isArabic ? 'تحقق من الرمز للحصول على التفاصيل الكاملة' : 'Scan to connect digitally'}</p>
                          </div>
                       </div>
                    </div>

                 </div>
              </div>
            )}
            
            {/* Footer Tagline */}
            <div className="pb-[32px] text-center shrink-0">
               <p className="text-[10px] uppercase tracking-[0.6em] font-black m-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Crafting Modern Journeys Across Dubai's Skyline
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}