import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
      // Generous pause for image assets to completely load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const canvas = await html2canvas(target, { 
        useCORS: true,
        backgroundColor: '#0b101b',
        logging: false, 
        scale: 2,
        windowWidth: 1000,
        onclone: (clonedDoc) => {
          const pdfContent = clonedDoc.getElementById('pdf-content-wrapper');
          if (pdfContent) {
            pdfContent.style.backgroundColor = '#000000';
            pdfContent.style.color = '#ffffff';
            
            const allElements = pdfContent.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i] as HTMLElement;
              const style = window.getComputedStyle(el);
              
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
      {/* UI visible to the user */}
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

      {/* Hidden PDF container - Fixed 1000x1414 scale guarantees universal compatibility */}
      <div 
        className="fixed top-0 left-[-5000px] -z-50 pointer-events-none overflow-hidden bg-[#0b101b] text-white" 
        style={{ 
          width: '1000px', 
          height: '1414px', 
          padding: '0', 
          direction: isArabic ? 'rtl' : 'ltr',
          fontFamily: isArabic ? '"Noto Sans Arabic", "Segoe UI Arabic", Tahoma, sans-serif' : '"Inter", sans-serif',
          letterSpacing: isArabic ? 'normal' : 'inherit',
          transform: 'scale(1)', 
          transformOrigin: 'top left'
        }}
      >
         <div ref={pdfRef} id="pdf-content-wrapper" className="w-[1000px] h-[1414px] bg-[#0b101b] text-white flex flex-col" style={{ width: '1000px', height: '1414px', backgroundColor: '#0b101b', color: '#ffffff' }}>
            
            {/* Header / Branding */}
            <div className={`px-[48px] py-[36px] border-b border-white/5 flex ${isArabic ? 'flex-row-reverse' : 'flex-row'} justify-between items-center bg-[#0b101b]`} style={{ backgroundColor: '#0b101b', borderColor: 'rgba(255,255,255,0.05)' }}>
               <img src={LOGO_URL} alt="Logo" style={{ height: '70px', width: 'auto', maxWidth: '250px', objectFit: 'contain' }} crossOrigin="anonymous" />
               <div className={isArabic ? 'text-left' : 'text-right'}>
                 <h1 className="text-[28px] font-black text-brand-gold uppercase tracking-tighter mb-[4px] leading-none">Estate Global</h1>
                 <p className="text-white/40 text-[11px] font-bold tracking-[0.2em] uppercase m-0 leading-none">Premium Real Estate Portfolio</p>
               </div>
            </div>

            {/* Projects Container */}
            <div className="flex-1 px-[48px] py-[36px] overflow-hidden">
               {projects.slice(0, 1).map((project, i) => {
                  const mainImage = project.imageUrl && project.imageUrl.startsWith('http') 
                    ? project.imageUrl 
                    : getProjectImageUrl(project.name);
                    
                  return (
                  <div key={i} className="rounded-[32px] h-full flex flex-col overflow-hidden bg-[#121a2d] border border-white/5 shadow-2xl" style={{ backgroundColor: '#121a2d', borderColor: 'rgba(255,255,255,0.05)' }}>
                     {/* Hero Image */}
                     <div className="relative h-[440px] shrink-0">
                        <img src={mainImage} alt={project.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121a2d] via-black/40 to-transparent"></div>
                        <div className={`absolute bottom-[36px] ${isArabic ? 'right-[44px] text-right' : 'left-[44px]'}`}>
                           <h2 className="text-[52px] font-black text-white mb-[10px] leading-none drop-shadow-lg">{project.name}</h2>
                           <div className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''} text-brand-gold font-bold uppercase tracking-widest text-[16px] drop-shadow-md`}>
                              <MapPin size={20} className={isArabic ? 'ml-[8px]' : 'mr-[8px]'} />
                              {project.area}, {project.emirate}
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-[44px] flex-1 flex flex-col justify-between">
                        <div>
                           {/* Quick Stats Grid */}
                           <div className={`grid grid-cols-3 gap-[24px] mb-[40px] pb-[40px] border-b border-white/5 ${isArabic ? 'text-right' : ''}`} style={{ direction: isArabic ? 'rtl' : 'ltr' }}>
                              <div>
                                 <p className="text-[12px] uppercase tracking-[0.2em] text-white/40 mb-[10px] font-black">Developer</p>
                                 <p className="text-[22px] font-bold text-white leading-tight truncate">{project.developer}</p>
                              </div>
                              <div>
                                 <p className="text-[12px] uppercase tracking-[0.2em] text-white/40 mb-[10px] font-black">Starting Price</p>
                                 <p className="text-[22px] font-bold text-brand-gold leading-tight">{project.priceAED ? new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(project.priceAED) : project.startingPrice}</p>
                              </div>
                              <div>
                                 <p className="text-[12px] uppercase tracking-[0.2em] text-white/40 mb-[10px] font-black">Handover</p>
                                 <p className="text-[22px] font-bold text-white uppercase leading-tight">{project.handover}</p>
                              </div>
                           </div>

                          {/* Content Split */}
                          <div className={`grid grid-cols-2 gap-[56px]`}>
                             <div className={isArabic ? 'order-2 text-right' : 'text-left'}>
                                <h3 className="text-brand-gold font-black uppercase tracking-[0.2em] text-[12px] mb-[20px]">Project Masterplan</h3>
                                {/* Removed text-justify for better html2canvas rendering */}
                                <p className={`text-white/70 text-[14px] leading-[1.7] ${isArabic ? 'text-right' : 'text-left'}`}>
                                  {project.description}
                                </p>
                             </div>
                             <div className={isArabic ? 'order-1 text-right' : 'text-left'}>
                                <h3 className="text-brand-gold font-black uppercase tracking-[0.2em] text-[12px] mb-[20px]">World-Class Amenities</h3>
                                <div className="grid grid-cols-2 gap-x-[20px] gap-y-[18px]">
                                  {project.amenities?.slice(0, 8).map(a => (
                                    <div key={a} className={`flex items-center gap-[12px] ${isArabic ? 'flex-row-reverse text-right' : ''} text-white/80 text-[13px] font-medium leading-snug`}>
                                      <ShieldCheck size={16} className="text-brand-gold shrink-0" />
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

            {/* Premium Agent Bio - Layout & Typographic Adjustments */}
            {appUser && (
              <div className="mx-[48px] mb-[32px] p-[36px] rounded-[32px] bg-[#121a2d] border border-brand-gold/20 relative overflow-hidden shrink-0" style={{ backgroundColor: '#121a2d', borderColor: 'rgba(197,160,89,0.2)' }}>
                 <div className="absolute -top-[60px] -right-[60px] w-[200px] h-[200px] bg-brand-gold/5 rounded-full blur-[60px]"></div>
                 
                 <div className={`flex items-center ${isArabic ? 'flex-row-reverse text-right' : ''} gap-[36px] relative z-10`}>
                    
                    {/* Profile Image */}
                    <div className="relative shrink-0">
                       {appUser.photoURL ? (
                          <img src={appUser.photoURL || undefined} alt={appUser.displayName} className="w-[100px] h-[100px] rounded-[20px] border-2 border-brand-gold object-cover shadow-xl" crossOrigin="anonymous" />
                       ) : (
                          <div className="w-[100px] h-[100px] rounded-[20px] border-2 border-brand-gold bg-black flex items-center justify-center text-[36px] font-black text-brand-gold">
                            {appUser.displayName.charAt(0)}
                          </div>
                       )}
                       <div className={`absolute -bottom-[10px] ${isArabic ? '-left-[10px]' : '-right-[10px]'} bg-blue-500 text-white p-[6px] rounded-xl shadow-lg border-[3px] border-[#121a2d]`}>
                          <BadgeCheck size={20} strokeWidth={2.5} />
                       </div>
                    </div>
                    
                    {/* Agent Details */}
                    <div className="flex-1 min-w-0">
                       <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''} mb-[6px]`}>
                          {/* Font size reduced and truncated to prevent line-breaks */}
                          <h3 className="text-[24px] font-black text-white leading-none m-0 truncate pr-4">{appUser.displayName}</h3>
                          <span className="px-[14px] py-[6px] shrink-0 bg-brand-gold/10 text-brand-gold rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-brand-gold/20">
                             {isArabic ? 'شريك عقاري معتمد' : 'Verified Estates Partner'}
                          </span>
                       </div>
                       <p className="text-brand-gold/70 font-bold text-[11px] tracking-[0.2em] uppercase mb-[20px] leading-none">{appUser.companyName}</p>
                       
                       <div className={`grid grid-cols-2 gap-x-[24px] gap-y-[14px] pt-[20px] border-t border-white/10 ${isArabic ? 'text-right' : ''}`}>
                          <div className={isArabic ? 'order-2' : ''}>
                             {/* Labels increased for readability */}
                             <p className="text-[10px] uppercase text-white/40 font-black mb-[6px] tracking-wider">{isArabic ? 'اتصال مباشر' : 'Direct Contact'}</p>
                             <p className="text-white text-[15px] font-bold leading-none m-0">{appUser.phoneNumber}</p>
                          </div>
                          <div className={isArabic ? 'order-1' : ''}>
                             <p className="text-[10px] uppercase text-white/40 font-black mb-[6px] tracking-wider">{isArabic ? 'استعلام بالبريد' : 'Email Inquiry'}</p>
                             <p className="text-white text-[15px] font-bold leading-none m-0 truncate">{appUser.email}</p>
                          </div>
                          <div className="col-span-2 flex justify-between items-end text-brand-gold/50 border-t border-white/5 pt-[14px] mt-[4px]">
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
               <p className="text-white/20 text-[10px] uppercase tracking-[0.6em] font-black m-0">
                  Crafting Modern Journeys Across Dubai's Skyline
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}