import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Project } from '../../data/projects';
import { AppUser } from '../../contexts/AuthContext';
import { BadgeCheck, MapPin, Bed, FileDown, ShieldCheck } from 'lucide-react';
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
      // More generous pause for assets
      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = await html2canvas(target, { 
        useCORS: true,
        backgroundColor: '#0b101b',
        logging: true,
        scale: 2,
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          // Force standard colors on the cloned document to avoid oklab/oklch errors
          const pdfContent = clonedDoc.getElementById('pdf-content-wrapper');
          if (pdfContent) {
            pdfContent.style.backgroundColor = '#000000';
            pdfContent.style.color = '#ffffff';
            
            // Recursively search and replace oklch/oklab if they managed to sneak in
            const allElements = pdfContent.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i] as HTMLElement;
              const style = window.getComputedStyle(el);
              
              // We can't easily change computed styles of a clone, but we can override inline
              if (style.color.includes('okl') || style.color.includes('oklab')) el.style.color = '#ffffff';
              if (style.backgroundColor.includes('okl') || style.backgroundColor.includes('oklab')) el.style.backgroundColor = 'transparent';
              if (style.borderColor.includes('okl') || style.borderColor.includes('oklab')) el.style.borderColor = 'rgba(255,255,255,0.1)';
            }
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
         // Auto close on success after a short delay
         setTimeout(() => onClose(), 1000); 
      }
    }
  };

  // Support for Arabic / RTL
  const isArabic = document.documentElement.lang === 'ar' || 
                   document.cookie.includes('googtrans=/en/ar') ||
                   document.body.dir === 'rtl';

  // Automatically start generation when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      generatePDF();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0b101b] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl">
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
              className="w-full py-4 bg-brand-gold text-brand-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_6px_0_0_rgb(157,120,49)] hover:shadow-[0_2px_0_0_rgb(157,120,49)]"
             >
                Try Again
             </motion.button>
          ) : (
            !generating && (
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                onClick={generatePDF} 
                className="w-full py-4 bg-brand-gold text-brand-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_6px_0_0_rgb(157,120,49)] hover:shadow-[0_2px_0_0_rgb(157,120,49)]"
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

      {/* Hidden PDF container - Absolute Black Branding */}
      <div 
        className="fixed top-0 left-[-5000px] -z-50 pointer-events-none overflow-hidden bg-[#0b101b] text-white" 
        style={{ 
          width: '1000px', 
          height: '1414px', 
          padding: '0', 
          direction: isArabic ? 'rtl' : 'ltr',
          fontFamily: isArabic ? '"Noto Sans Arabic", "Segoe UI Arabic", Tahoma, sans-serif' : '"Inter", sans-serif',
          letterSpacing: isArabic ? 'normal' : 'inherit'
        }}
      >
         <div ref={pdfRef} id="pdf-content-wrapper" className="w-full h-full bg-[#0b101b] text-white flex flex-col" style={{ width: '1000px', height: '1414px', backgroundColor: '#0b101b', color: '#ffffff' }}>
            {/* Header / Branding */}
            <div className={`px-12 py-8 border-b border-white/5 flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} justify-between items-center bg-[#0b101b]`} style={{ backgroundColor: '#0b101b', borderColor: 'rgba(255,255,255,0.05)' }}>
               <img src={LOGO_URL} alt="Logo" style={{height: '70px', objectFit: 'contain'}} crossOrigin="anonymous" />
               <div className={isArabic ? 'text-left' : 'text-right'}>
                 <h1 className="text-3xl font-black text-brand-gold uppercase tracking-tighter mb-1">Estate Global</h1>
                 <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Premium Real Estate Portfolio</p>
               </div>
            </div>

            {/* Projects Container - Flex Grow to take available space but respect limits */}
            <div className="flex-1 px-12 py-8 overflow-hidden">
               {projects.slice(0, 1).map((project, i) => {
                  const mainImage = project.imageUrl && project.imageUrl.startsWith('http') 
                    ? project.imageUrl 
                    : getProjectImageUrl(project.name);
                    
                  return (
                  <div key={i} className="rounded-[2.5rem] h-full flex flex-col overflow-hidden bg-[#121a2d] border border-white/5 shadow-2xl" style={{ backgroundColor: '#121a2d', borderColor: 'rgba(255,255,255,0.05)' }}>
                     <div className="relative h-[480px] shrink-0">
                        <img src={mainImage} alt={project.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className={`absolute bottom-8 ${isArabic ? 'right-10 text-right' : 'left-10'}`}>
                           <h2 className="text-5xl font-black text-white mb-2 leading-normal drop-shadow-2xl">{project.name}</h2>
                           <div className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''} text-brand-gold font-bold uppercase tracking-widest text-sm`}>
                              <MapPin size={18} className={isArabic ? 'ml-2' : 'mr-2'} />
                              {project.area}, {project.emirate}
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                           <div className={`grid grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/5 ${isArabic ? 'text-right' : ''}`} style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
                              <div>
                                 <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-black">Developer</p>
                                 <p className="text-xl font-bold text-white leading-normal">{project.developer}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-black">Starting Price</p>
                                 <p className="text-xl font-bold text-brand-gold leading-normal">{project.priceAED ? new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(project.priceAED) : project.startingPrice}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-black">Handover</p>
                                 <p className="text-xl font-bold text-white uppercase leading-normal">{project.handover}</p>
                              </div>
                           </div>

            <div className={`grid grid-cols-2 gap-12`}>
               <div className={isArabic ? 'order-2 text-right' : 'text-left'}>
                  <h3 className="text-brand-gold font-black uppercase tracking-[0.2em] text-[10px] mb-6">Project Masterplan</h3>
                  <p className={`text-white/60 text-[13px] leading-[1.8] ${isArabic ? 'text-right' : 'text-justify'}`}>
                    {project.description}
                  </p>
               </div>
               <div className={isArabic ? 'order-1 text-right' : 'text-left'}>
                  <h3 className="text-brand-gold font-black uppercase tracking-[0.2em] text-[10px] mb-6">World-Class Amenities</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    {project.amenities?.slice(0, 8).map(a => (
                      <div key={a} className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse text-right' : ''} text-white/70 text-[11px] font-medium leading-normal`}>
                        <ShieldCheck size={14} className="text-brand-gold shrink-0" />
                        <span className="leading-tight">{a}</span>
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

            {/* Premium Agent Bio - Fixed at bottom */}
            {appUser && (
              <div className="mx-12 mb-8 p-10 rounded-[2.5rem] bg-[#121a2d] border border-brand-gold/20 relative overflow-hidden shrink-0" style={{ backgroundColor: '#121a2d', borderColor: 'rgba(197,160,89,0.2)' }}>
                 <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-gold/5 rounded-full blur-[60px]"></div>
                 
                 <div className={`flex items-center ${isArabic ? 'flex-row-reverse text-right' : ''} gap-8 relative z-10`}>
                    <div className="relative">
                       {appUser.photoURL ? (
                          <img src={appUser.photoURL || undefined} alt={appUser.displayName} className="w-24 h-24 rounded-2xl border-2 border-brand-gold object-cover shadow-2xl" crossOrigin="anonymous" />
                       ) : (
                          <div className="w-24 h-24 rounded-2xl border-2 border-brand-gold bg-black flex items-center justify-center text-3xl font-black text-brand-gold">
                            {appUser.displayName.charAt(0)}
                          </div>
                       )}
                       <div className={`absolute -bottom-2 ${isArabic ? '-left-2' : '-right-2'} bg-blue-500 text-white p-1.5 rounded-lg shadow-lg border-2 border-black`}>
                          <BadgeCheck size={16} />
                       </div>
                    </div>
                    
                    <div className="flex-1">
                       <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''} mb-1`}>
                          <h3 className="text-3xl font-black text-white leading-normal">{appUser.displayName}</h3>
                          <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-[8px] font-black uppercase tracking-[0.1em] border border-brand-gold/20">
                             {isArabic ? 'شريك عقاري معتمد' : 'Verified Estates Partner'}
                          </span>
                       </div>
                       <p className="text-brand-gold/60 font-bold text-[10px] tracking-[0.3em] uppercase mb-4 leading-normal">{appUser.companyName}</p>
                       
                       <div className={`grid grid-cols-2 gap-x-8 gap-y-3 pt-4 border-t border-white/5 ${isArabic ? 'text-right' : ''}`}>
                          <div className={isArabic ? 'order-2' : ''}>
                             <p className="text-[8px] uppercase text-white/30 font-black mb-1">{isArabic ? 'اتصال مباشر' : 'Direct Contact'}</p>
                             <p className="text-white text-sm font-bold leading-normal">{appUser.phoneNumber}</p>
                          </div>
                          <div className={isArabic ? 'order-1' : ''}>
                             <p className="text-[8px] uppercase text-white/30 font-black mb-1">{isArabic ? 'استعلام بالبريد' : 'Email Inquiry'}</p>
                             <p className="text-white text-sm font-bold leading-normal">{appUser.email}</p>
                          </div>
                          <div className="col-span-2 flex justify-between items-end text-brand-gold/40 border-t border-white/5 pt-3">
                             <p className="text-[10px] font-bold uppercase tracking-widest leading-normal">{appUser.reraNumber || 'PRP-29837 (Applied)'}</p>
                             <p className="text-[8px] italic">{isArabic ? 'تحقق من الرمز للحصول على التفاصيل الكاملة' : 'Scan to connect digitally'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
            
            {/* Footer Tagline */}
            <div className="pb-8 text-center shrink-0">
               <p className="text-white/10 text-[8px] uppercase tracking-[0.5em] font-black">
                  Crafting Modern Journeys Across Dubai's Skyline
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
