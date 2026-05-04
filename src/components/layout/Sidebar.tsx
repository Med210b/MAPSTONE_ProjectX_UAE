import { LogOut, LayoutDashboard, Building2, Map, Users, Settings, LogIn, UserCircle, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LOGO_URL = "https://i.postimg.cc/NMvYkDw1/a9cc13e9-79cc-4862-9097-ee23629b69ca.png";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, appUser, isAdmin, loginWithGoogle, logout } = useAuth();

  const navItems = user ? [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'developers', icon: Users, label: 'Developers' },
    { id: 'projects', icon: Building2, label: 'Projects' },
    { id: 'map', icon: Map, label: 'Map Explorer' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    ...(isAdmin ? [{ id: 'admin', icon: ShieldCheck, label: 'Admin Tools' }] : []),
  ] : [
    { id: 'login', icon: LogIn, label: 'Login' }
  ];

  return (
    <aside className="w-64 lg:w-[280px] h-full bg-[#0A1A2F]/90 backdrop-blur-2xl border-r border-[#E5C07B]/10 flex flex-col pt-6 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-white/5 mb-6 text-center flex flex-col items-center keep-dark">
        <img src={LOGO_URL} alt="Mapstone Group" className="h-44 w-auto mb-3 drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-white/10 text-brand-gold border border-white/10' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} className="mr-3" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User / Footer */}
      <div className="p-4 border-t border-white/5 mt-auto">
        {user ? (
          <>
            <button 
               onClick={() => onTabChange('settings')}
               className="flex items-center mb-4 px-2 hover:bg-white/5 rounded-2xl py-2 transition-all text-left w-full group"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-dark p-[2px] flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                {(appUser?.photoURL || user.photoURL) ? (
                  <img 
                    key={appUser?.photoURL || user.photoURL || 'default'}
                    src={appUser?.photoURL || user.photoURL || undefined} 
                    alt={appUser?.displayName || user.displayName || 'User'} 
                    className="w-full h-full rounded-full border-2 border-brand-black shadow-lg object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-brand-black bg-gray-800 flex items-center justify-center">
                    <UserCircle size={24} className="text-white/50" />
                  </div>
                )}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-bold text-white truncate group-hover:text-brand-gold transition-colors">{appUser?.displayName || user.displayName || 'User'}</p>
                <div className="text-[10px] text-brand-gold flex items-center truncate font-bold uppercase tracking-widest mt-0.5">
                   <div className={`w-2 h-2 rounded-full mr-1.5 shadow-[0_0_8px_rgba(var(--color-status))] ${
                     isAdmin ? 'bg-green-500' : (appUser?.isVerifiedAgent ? 'bg-brand-gold' : 'bg-white/20')
                   }`}></div> 
                   {isAdmin ? 'Super Admin' : (appUser?.isVerifiedAgent ? 'Verified Agent' : 'Standard')}
                </div>
              </div>
            </button>
            <button onClick={logout} className="w-full flex items-center px-4 py-2 text-white/50 hover:text-white transition-colors text-sm rounded-lg hover:bg-white/5">
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </>
        ) : (
          <button 
            onClick={() => onTabChange('login')} 
            className="w-full flex items-center justify-center px-4 py-3 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 rounded-xl transition-all font-bold text-sm border border-brand-gold/20"
          >
            <LogIn size={18} className="mr-2" />
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
