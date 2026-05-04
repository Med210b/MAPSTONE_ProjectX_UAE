import { LayoutDashboard, Building2, Map, Users, Settings, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

export function MobileNav({ activeTab, onTabChange, isAdmin }: MobileNavProps) {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'developers', icon: Users, label: 'Devs' },
    { id: 'projects', icon: Building2, label: 'Projects' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'settings', icon: Settings, label: 'Profile', isProfile: true },
    ...(isAdmin ? [{ id: 'admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ];

  const { user, appUser } = useAuth();
  const profilePic = appUser?.photoURL || user?.photoURL;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A1A2F]/95 backdrop-blur-3xl border-t border-brand-gold/10 px-1 py-1.5 z-50 md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center w-full max-w-lg mx-auto">
        {items.map((item) => (
          <button 
            key={item.id} 
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center p-1.5 flex-1 relative group"
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTabMobile"
                className="absolute -top-1.5 w-8 h-0.5 bg-brand-gold rounded-full shadow-[0_0_8px_rgba(200,169,106,0.5)]"
              />
            )}
            
            {item.isProfile && user ? (
              <div className={`w-5 h-5 rounded-full border transition-colors overflow-hidden ${activeTab === item.id ? 'border-brand-gold' : 'border-white/20'}`}>
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <item.icon size={12} className={activeTab === item.id ? 'text-brand-gold' : 'text-white/30'} />
                  </div>
                )}
              </div>
            ) : (
              <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-brand-gold' : 'text-white/30'}`} />
            )}
            <span className={`text-[8px] mt-1 font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === item.id ? 'text-brand-gold opacity-100' : 'text-white/40 opacity-70'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
