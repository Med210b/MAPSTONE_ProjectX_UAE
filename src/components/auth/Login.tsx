import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LogOut, BadgeCheck, Mail, Lock, User, Phone, Building2, Hash, Image as ImageIcon, Sparkles } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LOGO_URL } from '../../App';

export function Login() {
  const { user, appUser, isAdmin, loginWithGoogle, loginWithEmail, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName,
          email,
          reraNumber,
          companyName,
          phoneNumber,
          photoURL,
          isVerifiedAgent: true,
          createdAt: new Date().toISOString()
        });
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. Please enable it in the Firebase Console, or use Google Sign-in.');
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid credentials. If you haven't registered this email yet, click 'Create an account' below.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Please add it to "Authorized domains" in your Firebase Consol.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // Just ignore
      } else {
        setError(err.message || 'Google authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto hide-scrollbar z-10">
        <div className="min-h-full flex flex-col items-center justify-center py-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 w-full flex flex-col items-center shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-gold/10 rounded-full blur-[60px] group-hover:bg-brand-gold/20 transition-colors"></div>
              
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full mb-6 object-cover ring-4 ring-brand-gold/30 shadow-2xl" />
              ) : (
                 <div className="w-24 h-24 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6 ring-4 ring-brand-gold/30">
                   <span className="text-3xl font-black text-brand-gold">{user.email?.charAt(0).toUpperCase()}</span>
                 </div>
              )}
              
              <h2 className="text-2xl font-black text-white mb-1 text-center">{user.displayName || 'Welcome Back'}</h2>
              <p className="text-white/40 text-sm mb-8 text-center font-medium uppercase tracking-[0.2em]">{user.email}</p>
              
              <AnimatePresence mode="wait">
                {isAdmin ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center text-green-400 bg-green-400/5 px-4 py-2 rounded-xl mb-8 border border-green-400/20 shadow-lg"
                  >
                    <BadgeCheck size={18} className="mr-3" /> 
                    <span className="text-xs font-black uppercase tracking-widest">Super Admin</span>
                  </motion.div>
                ) : appUser?.isVerifiedAgent ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center text-brand-gold bg-brand-gold/5 px-4 py-2 rounded-xl mb-8 border border-brand-gold/20 shadow-lg"
                  >
                    <Sparkles size={18} className="mr-3" />
                    <span className="text-xs font-black uppercase tracking-widest">Verified Agent</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center text-white/40 bg-white/5 px-4 py-2 rounded-xl mb-8 border border-white/10 shadow-lg"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Standard User</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={logout}
                className="w-full py-4 px-6 bg-white/5 hover:bg-red-500/10 text-white rounded-2xl transition-all flex items-center justify-center border border-white/10 hover:border-red-500/20 group/btn"
              >
                <LogOut size={20} className="mr-3 transition-transform group-hover/btn:translate-x-1" /> 
                <span className="font-bold">Sign Out</span>
              </button>
            </div>
            
            {!isAdmin && !appUser?.isVerifiedAgent && (
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="mt-8 text-white/30 text-xs text-center leading-relaxed max-w-xs mx-auto"
               >
                 Ready to upgrade? Visit <span className="text-brand-gold font-bold">Settings</span> to verify your agent status and unlock premium insights.
               </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto hide-scrollbar z-10 bg-gradient-to-b from-transparent to-brand-black/50">
      <div className="min-h-full flex flex-col items-center justify-center py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 max-w-md w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group"
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-gold/20 rounded-full blur-[50px] group-hover:bg-brand-gold/30 transition-colors pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-gold/10 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="text-center mb-6 md:mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-40 h-24 md:w-48 md:h-32 mx-auto mb-4 md:mb-8 flex items-center justify-center"
          >
            <img src={LOGO_URL} alt="Mapstone Group" className="w-full h-full object-contain" />
          </motion.div>
          
          <h2 className="luxury-heading text-xl md:text-3xl mb-1">Mapstone Group</h2>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 md:mb-8 p-3 md:p-4 bg-red-500/10 border border-red-500/20 text-[10px] md:text-xs rounded-2xl text-center font-bold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-3 md:space-y-5 mb-4 md:mb-6">
          <AnimatePresence mode="popLayout">
            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 md:space-y-5 overflow-hidden"
              >
                {[
                  { icon: User, label: 'Full Name', value: displayName, setter: setDisplayName, placeholder: 'Ahmed Al Saadi', type: 'text' },
                  { icon: Hash, label: 'RERA Number', value: reraNumber, setter: setReraNumber, placeholder: 'Broker ID', type: 'text' },
                  { icon: Building2, label: 'Company', value: companyName, setter: setCompanyName, placeholder: 'Real Estate Entity', type: 'text' },
                  { icon: Phone, label: 'Phone', value: phoneNumber, setter: setPhoneNumber, placeholder: '+971 5x xxx xxxx', type: 'tel' },
                  { icon: ImageIcon, label: 'Photo URL', value: photoURL, setter: setPhotoURL, placeholder: 'https://...', type: 'url' },
                ].map((input, idx) => (
                  <div key={idx} className="relative group/field">
                    <input.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
                    <input 
                      type={input.type} 
                      required
                      value={input.value}
                      onChange={(e) => input.setter(e.target.value)}
                      placeholder={input.placeholder}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 md:pl-12 pr-4 py-3.5 md:py-4 text-sm md:text-base text-white placeholder-white/20 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group/field">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 md:pl-12 pr-4 py-3.5 md:py-4 text-sm md:text-base text-white placeholder-white/20 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all shadow-inner"
            />
          </div>
          
          <div className="relative group/field">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-brand-gold transition-colors w-4 h-4 md:w-4.5 md:h-4.5" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Security Key"
              className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 md:pl-12 pr-4 py-3.5 md:py-4 text-sm md:text-base text-white placeholder-white/20 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all shadow-inner"
            />
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 md:py-4.5 px-6 luxury-button-primary rounded-2xl flex items-center justify-center disabled:opacity-50 text-[10px] md:text-xs"
          >
            {loading ? (
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-brand-black border-t-transparent rounded-full animate-spin"></div>
            ) : (isSignUp ? 'Create Agent ID' : 'Identify')}
          </motion.button>
        </form>

        <div className="text-center mb-8">
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold uppercase tracking-widest text-brand-gold/60 hover:text-brand-gold transition-colors"
          >
            {isSignUp ? 'Back to sign in' : 'Establish new credentials'}
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
            <span className="px-4 bg-brand-black/20 backdrop-blur-md text-white/20">or authenticate via</span>
          </div>
        </div>

        <motion.button 
          whileHover={{ y: -2 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 px-6 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center border border-white/5 space-x-4 shadow-xl disabled:opacity-50"
        >
           <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
           </svg>
           <span className="tracking-tight">Google Identity</span>
        </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
