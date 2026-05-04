import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, Phone, Building2, Hash, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ProfileSettings() {
  const { user, appUser, updateAppUser } = useAuth();
  
  const [displayName, setDisplayName] = useState(appUser?.displayName || user?.displayName || '');
  const [reraNumber, setReraNumber] = useState(appUser?.reraNumber || '');
  const [companyName, setCompanyName] = useState(appUser?.companyName || '');
  const [phoneNumber, setPhoneNumber] = useState(appUser?.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(appUser?.photoURL || '');
  const hasInitialized = useRef(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sync state with appUser updates
  React.useEffect(() => {
    if (appUser && !hasInitialized.current) {
      if (appUser.displayName) setDisplayName(appUser.displayName);
      if (appUser.reraNumber) setReraNumber(appUser.reraNumber);
      if (appUser.companyName) setCompanyName(appUser.companyName);
      if (appUser.phoneNumber) setPhoneNumber(appUser.phoneNumber);
      if (appUser.photoURL) setPhotoURL(appUser.photoURL);
      hasInitialized.current = true;
    }
  }, [appUser]);

  const handleUpdate = async (e?: React.FormEvent, customPhotoURL?: string) => {
    if (e) e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const userData = {
        displayName: displayName || (appUser?.displayName ?? ''),
        reraNumber: reraNumber || (appUser?.reraNumber ?? ''),
        companyName: companyName || (appUser?.companyName ?? ''),
        phoneNumber: phoneNumber || (appUser?.phoneNumber ?? ''),
        photoURL: customPhotoURL || photoURL,
        isVerifiedAgent: true,
        updatedAt: new Date().toISOString()
      };

      console.log('Pushing profile update to Firestore:', user.uid, userData);
      
      // Update Firestore
      const updatePromise = setDoc(doc(db, 'users', user.uid), {
        ...userData,
        email: user.email || (appUser?.email ?? '')
      }, { merge: true });

      // Update Auth Profile if photoURL changed
      const authUpdatePromise = customPhotoURL || photoURL ? 
        import('firebase/auth').then(({ updateProfile }) => 
          updateProfile(user, { 
            displayName: userData.displayName,
            photoURL: customPhotoURL || photoURL 
          })
        ) : Promise.resolve();

      await Promise.all([updatePromise, authUpdatePromise]);

      // Update context state immediately for cross-tab/sidebar responsiveness
      if (updateAppUser) {
        updateAppUser(userData);
      } else {
        console.warn('updateAppUser not found in context');
      }

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError('Save failed. Retrying in background...');
      // Even if it fails, we keep the state so Firestore might retry via offline persistence
      if (err.code || err.name === 'FirebaseError') {
        try {
          handleFirestoreError(err, OperationType.UPDATE, 'users');
        } catch(e) { }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <section className="bg-[#0A1A2F]/40 border border-brand-gold/10 rounded-[2rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl group">
      <h3 className="text-xl md:text-2xl luxury-heading mb-8">Identity Portfolio</h3>
      
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-2xl flex items-center shadow-lg"
        >
          <CheckCircle size={18} className="mr-3 flex-shrink-0" /> {message}
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl shadow-lg"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleUpdate} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 bg-black/30 rounded-2xl border border-white/5">
          <div className="relative group">
            {photoURL ? (
              <img 
                src={photoURL} 
                alt="Profile" 
                className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-2 border-brand-gold ring-4 ring-brand-gold/10 shadow-2xl" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-brand-gold/10 flex items-center justify-center border-2 border-brand-gold ring-4 ring-brand-gold/10">
                <User className="text-brand-gold w-6 h-6 md:w-8 md:h-8" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-1 md:space-y-2 w-full">
            <div className="mb-2">
              <h4 className="text-white font-bold opacity-50 text-[8px] md:text-[10px] uppercase tracking-widest mb-1">Active Profile</h4>
              <p className="text-base md:text-lg font-black text-white truncate max-w-full">{displayName || 'Anonymous User'}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${appUser?.isVerifiedAgent ? 'bg-brand-gold' : 'bg-white/20'}`}></div>
                <span className="text-[8px] md:text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                  {appUser?.isVerifiedAgent ? 'Verified Agent' : 'Standard'}
                </span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wider mb-2 ml-1">Photo URL</label>
            <div className="relative group">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
              <input 
                type="url" 
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 md:pl-12 pr-4 py-3 md:py-3.5 text-xs md:text-sm text-white placeholder-white/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wider mb-2 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
              <input 
                type="text" 
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 md:pl-12 pr-4 py-3 md:py-3.5 text-xs md:text-sm text-white placeholder-white/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wider mb-2 ml-1">RERA Number</label>
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
              <input 
                type="text" 
                required
                value={reraNumber}
                onChange={(e) => setReraNumber(e.target.value)}
                placeholder="12345"
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 md:pl-12 pr-4 py-3 md:py-3.5 text-xs md:text-sm text-white placeholder-white/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wider mb-2 ml-1">Company Name</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
              <input 
                type="text" 
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Real Estate Co."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 md:pl-12 pr-4 py-3 md:py-3.5 text-xs md:text-sm text-white placeholder-white/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wider mb-2 ml-1">Phone</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
              <input 
                type="tel" 
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+971..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 md:pl-12 pr-4 py-3 md:py-3.5 text-xs md:text-sm text-white placeholder-white/20 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-5 rounded-2xl luxury-button-primary transition-all duration-300 flex items-center justify-center gap-3 mt-4 disabled:opacity-50`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-brand-blue-dark border-t-transparent rounded-full animate-spin"></div>
              <span>SYNCHRONIZING...</span>
            </div>
          ) : (
            'CONFIRM UPDATES'
          )}
        </button>

        {/* Bottom Spacer for Mobile Nav */}
        <div className="h-20 md:hidden"></div>
      </form>
    </section>
  );
}
