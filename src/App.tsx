import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { TopBarFilters } from './components/filters/TopBarFilters';
import { ProjectCard } from './components/ui/ProjectCard';
import { MapComponent } from './components/map/MapComponent';
import { Login } from './components/auth/Login';
import { ProfileSettings } from './components/auth/ProfileSettings';
import { AddDeveloperForm } from './components/admin/AddDeveloperForm';
import { ProjectForm } from './components/admin/ProjectForm';
import { ProjectDetails } from './components/ui/ProjectDetails';
import { QuickView } from './components/ui/QuickView';
import { PdfGenerator } from './components/ui/PdfGenerator';
import { DeveloperLogo } from './components/ui/DeveloperLogo';
import { AuroraBackground } from './components/ui/AuroraBackground';
import { Emirate, Project } from './data/projects';
import { Search, Bell, Menu, Map as MapIcon, List, Navigation, BadgeCheck, Users, Building2, Settings as SettingsIcon, ChevronLeft, CheckSquare, Presentation, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import { useData } from './hooks/useData';
import { LanguageSelector } from './components/common/LanguageSelector';
import { PreferenceSelector } from './components/common/PreferenceSelector';
import { usePreferences } from './contexts/PreferencesContext';
import { getProjectImageUrl } from './lib/projectUtils';

export const LOGO_URL = "https://i.postimg.cc/NMvYkDw1/a9cc13e9-79cc-4862-9097-ee23629b69ca.png";


export default function App() {
  const { user, appUser, isAdmin, loading } = useAuth();
  const { projects, developers } = useData();
  const { formatPrice } = usePreferences();
  const [activeTab, setActiveTabRaw] = useState('login');
  const [history, setHistory] = useState<string[]>(['login']);

  const setActiveTab = (tab: string) => {
    if (tab !== activeTab) {
      setHistory(prev => [...prev, tab]);
      setActiveTabRaw(tab);
    }
  };

  const setInitialTab = (tab: string) => {
    setActiveTabRaw(tab);
    setHistory([tab]);
  };

  const handleBack = () => {
    setHistory(prev => {
      if (prev.length > 1) {
        const newHist = [...prev];
        newHist.pop(); // Remove current
        const previousTab = newHist[newHist.length - 1];
        setActiveTabRaw(previousTab);
        return newHist;
      }
      return prev;
    });
  };

  const [selectedDeveloperFilter, setSelectedDeveloperFilter] = useState<string | null>(null);
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddDev, setShowAddDev] = useState(false);
  
  // GitHub Sync Test - 2026-04-28
  const [selectedEmirate, setSelectedEmirate] = useState<string>('All');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['All Areas']);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailedProject, setDetailedProject] = useState<Project | null>(null);
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);

  // Sync selectedProject with details/quickview for map centering
  useEffect(() => {
    if (detailedProject) {
      setSelectedProject(detailedProject);
    }
  }, [detailedProject]);

  useEffect(() => {
    if (quickViewProject) {
      setSelectedProject(quickViewProject);
    }
  }, [quickViewProject]);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  // Mobile specific state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProjectsForPdf, setSelectedProjectsForPdf] = useState<Project[]>([]);
  const [showPdfGenerator, setShowPdfGenerator] = useState(false);

  const handleDownloadPdf = (project: Project) => {
    setSelectedProjectsForPdf([project]);
    setShowPdfGenerator(true);
  };

  const toggleProjectSelection = (project: Project) => {
    setSelectedProjectsForPdf(prev => {
      const isSelected = prev.some(p => p.id === project.id);
      if (isSelected) {
        return prev.filter(p => p.id !== project.id);
      } else {
        return [...prev, project];
      }
    });
  };

  const handleAreaToggle = (area: string) => {
    if (area === 'All Areas') {
      setSelectedAreas(['All Areas']);
      return;
    }

    setSelectedAreas(prev => {
      const newAreas = prev.filter(a => a !== 'All Areas');
      if (newAreas.includes(area)) {
        const filtered = newAreas.filter(a => a !== area);
        return filtered.length === 0 ? ['All Areas'] : filtered;
      } else {
        return [...newAreas, area];
      }
    });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchEmirate = selectedEmirate === 'All' || p.emirate === selectedEmirate;
      const matchArea = selectedAreas.includes('All Areas') || selectedAreas.includes(p.area);
      
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchLower) || 
        p.developer.toLowerCase().includes(searchLower) || 
        p.area.toLowerCase().includes(searchLower);

      const matchDeveloper = !selectedDeveloperFilter || 
        p.developer.toLowerCase().includes(selectedDeveloperFilter.toLowerCase());

      return matchEmirate && matchArea && matchSearch && matchDeveloper;
    });
  }, [selectedEmirate, selectedAreas, searchQuery, selectedDeveloperFilter, projects]);

  const handleViewOnMap = (project: Project) => {
    setSelectedProject(project);
    if (activeTab !== 'projects' && activeTab !== 'map') {
      setActiveTab('projects');
    }
    if (window.innerWidth < 768) {
      setViewMode('map');
    }
  };

  const handleDeveloperClick = (developerName: string) => {
    setSelectedDeveloperFilter(developerName);
    setActiveTab('projects');
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (activeTab !== 'login') {
          setInitialTab('login');
        }
      } else if (activeTab === 'login') {
        setInitialTab('projects');
      }
    }
  }, [user, loading, activeTab]);

  useEffect(() => {
    if (!darkMode) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center relative bg-[#02060D]">
        <AuroraBackground />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <img src={LOGO_URL} alt="Mapstone Group" className="h-48 w-auto mb-8 drop-shadow-[0_0_30px_rgba(200,169,106,0.2)]" />
          <h2 className="luxury-heading text-xl md:text-2xl animate-pulse">Initializing Assets</h2>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto hide-scrollbar">
            <h2 className="text-lg md:text-3xl luxury-heading mb-4 md:mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
              <div className="bg-[#0A1A2F]/40 border border-brand-gold/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 backdrop-blur-xl group hover:border-brand-gold/30 transition-all shadow-lg">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 md:p-3 bg-brand-gold/10 text-brand-gold rounded-xl md:rounded-2xl border border-brand-gold/20"><Building2 size={18} className="md:w-6 md:h-6" /></div>
                  <span className="text-lg md:text-2xl font-black text-brand-gold group-hover:scale-110 transition-transform">{projects.length}</span>
                </div>
                <h3 className="text-brand-gold/40 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px]">Total Assets</h3>
              </div>
              <div className="bg-[#0A1A2F]/40 border border-brand-gold/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 backdrop-blur-xl group hover:border-brand-gold/30 transition-all shadow-lg">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 md:p-3 bg-brand-gold/10 text-brand-gold rounded-xl md:rounded-2xl border border-brand-gold/20"><Users size={18} className="md:w-6 md:h-6" /></div>
                  <span className="text-lg md:text-2xl font-black text-brand-gold group-hover:scale-110 transition-transform">{developers.length}</span>
                </div>
                <h3 className="text-brand-gold/40 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px]">Elite Developers</h3>
              </div>
              <div className="bg-[#0A1A2F]/40 border border-brand-gold/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 backdrop-blur-xl group hover:border-brand-gold/30 transition-all shadow-lg">
                <div className="flex justify-between items-start mb-2 md:mb-4">
                  <div className="p-2 md:p-3 bg-brand-gold/10 text-brand-gold rounded-xl md:rounded-2xl border border-brand-gold/20"><MapIcon size={18} className="md:w-6 md:h-6" /></div>
                  <span className="text-lg md:text-2xl font-black text-brand-gold group-hover:scale-110 transition-transform">7</span>
                </div>
                <h3 className="text-brand-gold/40 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px]">Strategic Regions</h3>
              </div>
            </div>
            
            <h3 className="text-[12px] md:text-lg luxury-heading mb-4 md:mb-6 tracking-[0.2em] md:tracking-[0.3em]">Curated Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {projects.slice(0, 3).map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onViewOnMap={handleViewOnMap}
                  onViewDetails={setDetailedProject} 
                  onQuickView={setQuickViewProject}
                />
              ))}
              {projects.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white/50">No projects added yet.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'developers':
        return (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto hide-scrollbar z-10 pb-20 md:pb-8">
            <h2 className="text-xl md:text-4xl luxury-heading mb-6 md:mb-10 text-center tracking-[0.1em] md:tracking-[0.2em]">The Developers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {developers.map(dev => {
                const projectCount = projects.filter(p => p.developer.toLowerCase().includes(dev.name.toLowerCase())).length;
                return (
                  <button 
                    key={dev.id} 
                    onClick={() => handleDeveloperClick(dev.name)}
                    className="flex flex-col items-center p-4 md:p-8 bg-[#0A1A2F]/40 hover:bg-brand-gold/5 hover:border-brand-gold border border-brand-gold/10 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 group shadow-lg backdrop-blur-xl"
                  >
                    <div className="relative w-12 h-12 md:w-20 md:h-20 rounded-full bg-white mb-3 md:mb-5 flex items-center justify-center p-2 md:p-3 overflow-hidden shadow-2xl border border-brand-gold/20 group-hover:border-brand-gold transition-all duration-500">
                      <DeveloperLogo 
                        name={dev.name} 
                        logoUrl={dev.logoUrl} 
                        className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-[10px] md:text-sm font-bold text-[#EDEDED] text-center line-clamp-1 uppercase tracking-wider mb-1 md:mb-2">{dev.name}</h3>
                    <p className="text-[8px] md:text-[10px] text-brand-gold/60 font-black tracking-[0.1em] md:tracking-[0.2em] uppercase">{projectCount} Assets</p>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'favorites':
        const favoriteProjects = projects.filter(p => appUser?.favorites?.includes(p.id));
        return (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto hide-scrollbar z-10 pb-20 md:pb-8">
            <div className="flex justify-between items-center mb-6 md:mb-10">
               <h2 className="text-lg md:text-3xl luxury-heading flex items-center gap-3 md:gap-4">
                 <Heart className="fill-brand-gold w-5 h-5 md:w-8 md:h-8" /> My Selection
               </h2>
               <span className="bg-[#152A47]/40 border border-brand-gold/20 px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[8px] md:text-xs text-brand-gold font-black uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-lg">
                 {favoriteProjects.length} Curated
               </span>
            </div>
            
            {favoriteProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {favoriteProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onViewOnMap={handleViewOnMap}
                    onViewDetails={setDetailedProject} 
                    onQuickView={setQuickViewProject}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-[#0A1A2F]/20 rounded-[3rem] border border-brand-gold/10 border-dashed backdrop-blur-sm">
                <div className="w-24 h-24 bg-brand-gold/5 rounded-full flex items-center justify-center mb-8 border border-brand-gold/10 shadow-inner">
                  <Heart size={36} className="text-brand-gold/20" />
                </div>
                <h3 className="text-2xl font-black text-[#EDEDED] mb-3 luxury-heading !text-[#EDEDED] !bg-none border-none shadow-none text-center">Exclusive Collection Empty</h3>
                <p className="text-[#EDEDED]/40 text-center max-w-sm mb-10 italic">
                  Explore our premier residences and mark them with the emblem of choice to build your private portfolio.
                </p>
                <button 
                  onClick={() => setActiveTab('projects')}
                  className="luxury-button-primary px-10 py-5 rounded-2xl text-xs font-black tracking-[0.3em]"
                >
                  EXPLORE COLLECTIONS
                </button>
              </div>
            )}
          </div>
        );

      case 'map':
        return (
          <div className="flex-1 w-full h-full relative z-10 pb-20 md:pb-0">
             <MapComponent 
               projects={filteredProjects} 
               selectedProject={selectedProject} 
               onProjectSelect={setSelectedProject} 
               onQuickView={setQuickViewProject}
             />
             <AnimatePresence>
               {selectedProject && (
                 <motion.div 
                   initial={{ opacity: 0, y: 50, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 50, scale: 0.9 }}
                   className="absolute bottom-6 md:bottom-12 left-6 right-6 md:left-1/2 md:-translate-x-1/2 max-w-[320px] mx-auto z-40"
                 >
                   <div className="p-3 bg-black/90 backdrop-blur-2xl border border-brand-gold rounded-2xl shadow-2xl flex items-center cursor-pointer hover:bg-black transition-colors" 
                      onClick={() => {
                        setDetailedProject(selectedProject);
                        setSelectedProject(null);
                      }}
                    >
                     <img src={selectedProject.imageUrl || getProjectImageUrl(selectedProject.name)} className="w-20 h-20 rounded-xl object-cover" alt="" />
                     <div className="ml-4 flex-1">
                       <div className="flex items-center gap-1.5">
                         <h4 className="font-bold text-white text-sm whitespace-nowrap overflow-hidden text-ellipsis">{selectedProject.name}</h4>
                         {selectedProject.isVerifiedAgent && (
                           <div title="Verified Agent"><BadgeCheck size={14} className="text-blue-400 flex-shrink-0" /></div>
                         )}
                       </div>
                       
                       {(() => {
                         const developerData = developers.find(d => 
                           d.name.toLowerCase() === selectedProject.developer.toLowerCase() || 
                           selectedProject.developer.toLowerCase().includes(d.name.toLowerCase())
                         );
                         return (
                           <div className="flex items-center gap-1.5 mt-1">
                             {developerData && (
                               <DeveloperLogo 
                                 name={developerData.name} 
                                 logoUrl={developerData.logoUrl} 
                                 className="w-3 h-3 rounded-full bg-white object-contain" 
                               />
                             )}
                             <p className="text-[10px] text-white/60">{selectedProject.developer}</p>
                           </div>
                         );
                       })()}

                       <p className="text-xs text-brand-gold font-bold mt-1">
                         {selectedProject.priceAED ? formatPrice(selectedProject.priceAED) : selectedProject.startingPrice}
                       </p>
                     </div>
                     <a 
                       href={`https://www.google.com/maps/search/?api=1&query=${selectedProject.mapCoordinates.lat},${selectedProject.mapCoordinates.lng}`}
                       target="_blank" 
                       rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       className="w-10 h-10 ml-3 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-black transition-colors"
                     >
                       <Navigation size={18} />
                     </a>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 p-6 md:p-8 pb-32 md:pb-8 overflow-y-auto hide-scrollbar z-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl luxury-heading mb-10 flex items-center">
                <SettingsIcon className="mr-4 text-brand-gold" /> System Configuration
              </h2>
              
              <div className="space-y-8">
                <section className="bg-[#0A1A2F]/40 border border-brand-gold/10 rounded-[2rem] p-6 md:p-10 shadow-xl backdrop-blur-xl">
                  <h3 className="text-base md:text-lg luxury-heading !text-transparent !bg-clip-text mb-8">Personalization</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-5 border-b border-brand-gold/5 last:border-0 hover:bg-brand-gold/5 -mx-4 px-4 rounded-2xl transition-all duration-300">
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-[#EDEDED] flex items-center gap-2">
                          Nocturnal Interface
                          {darkMode && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(200,169,106,1)]" />}
                        </h4>
                        <p className="text-xs text-[#EDEDED]/40 italic">Deep blue aesthetic optimization</p>
                      </div>
                      <div 
                        className={`w-14 h-7 rounded-full flex items-center p-1 cursor-pointer transition-all duration-500 ${darkMode ? 'bg-brand-gold shadow-[0_0_15px_rgba(200,169,106,0.3)]' : 'bg-white/10'}`}
                        onClick={() => setDarkMode(!darkMode)}
                      >
                        <div className={`w-5 h-5 bg-[#02060D] rounded-full shadow-lg transition-transform duration-500 ${darkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-5 border-b border-brand-gold/5 last:border-0 hover:bg-brand-gold/5 -mx-4 px-4 rounded-2xl transition-all duration-300">
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-[#EDEDED]">Priority Notifications</h4>
                        <p className="text-xs text-[#EDEDED]/40 italic">Instant alerts for premier inventory</p>
                      </div>
                      <div 
                        className={`w-14 h-7 rounded-full flex items-center p-1 cursor-pointer transition-all duration-500 ${notifications ? 'bg-brand-gold shadow-[0_0_15px_rgba(200,169,106,0.3)]' : 'bg-white/10'}`}
                        onClick={() => setNotifications(!notifications)}
                      >
                        <div className={`w-5 h-5 bg-[#02060D] rounded-full shadow-lg transition-transform duration-500 ${notifications ? 'translate-x-7' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-[#0A1A2F]/40 border border-brand-gold/10 rounded-[2rem] p-6 md:p-10 shadow-xl backdrop-blur-xl">
                  <h3 className="text-base md:text-lg luxury-heading !text-transparent !bg-clip-text mb-8">Regional Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-black/30 rounded-2xl border border-brand-gold/5 hover:border-brand-gold/20 transition-all group">
                      <p className="text-[10px] text-brand-gold/40 mb-4 font-black uppercase tracking-[0.2em] group-hover:text-brand-gold/60 transition-colors">Nominal Currency</p>
                      <PreferenceSelector />
                    </div>
                  </div>
                </section>
                
                {user && <ProfileSettings />}
              </div>
            </div>
          </div>
        );

      case 'login':
        return <Login />;

      case 'admin':
        if (!isAdmin) {
          return (
            <div className="flex-1 p-6 md:p-8 overflow-y-auto hide-scrollbar z-10 flex flex-col items-center justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-brand-gold mb-2">Access Denied</h2>
              <p className="text-white/50 text-sm md:text-base">You do not have administrative privileges.</p>
            </div>
          );
        }
        return (
          <div className="flex-1 p-6 md:p-8 overflow-y-auto hide-scrollbar z-10">
            <h2 className="text-xl md:text-2xl font-bold text-brand-gold mb-6 flex items-center"><BadgeCheck className="mr-3" /> Admin Controls</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
               <div className="bg-white/5 border border-brand-gold/30 rounded-2xl p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">Add New Project</h3>
                  <p className="text-white/50 text-xs md:text-sm mb-6">Create a new off-plan project listing. Required fields: name, developer, images, etc.</p>
                  <button onClick={() => setShowAddProject(true)} className="w-full py-3 bg-brand-gold text-brand-black font-bold rounded-xl hover:bg-brand-gold/90 transition-colors text-sm md:text-base">
                     + Add Project to Database
                  </button>
               </div>
               <div className="bg-white/5 border border-brand-gold/30 rounded-2xl p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">Add Developer</h3>
                  <p className="text-white/50 text-xs md:text-sm mb-6">Add a new developer and configure their logo URL to be used across the app.</p>
                  <button onClick={() => setShowAddDev(true)} className="w-full py-3 bg-brand-gold text-brand-black font-bold rounded-xl hover:bg-brand-gold/90 transition-colors text-sm md:text-base">
                     + Add Developer
                  </button>
               </div>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white mb-4">Manage Projects</h3>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 last:border-b-0">
                   <div>
                     <h4 className="font-bold text-white">{p.name}</h4>
                     <p className="text-xs text-white/50">{p.developer} • {p.area}, {p.emirate}</p>
                   </div>
                   <button 
                     onClick={() => setEditingProject(p)}
                     className="px-4 py-2 bg-white/5 hover:bg-brand-gold hover:text-black rounded-lg text-sm font-medium transition-colors"
                   >
                     Edit
                   </button>
                </div>
              ))}
              {projects.length === 0 && <div className="p-6 text-center text-white/50 text-sm">No projects found.</div>}
            </div>
          </div>
        );

      case 'projects':
      default:
        return (
          <div className="flex-1 flex flex-col h-full relative z-10 w-full overflow-hidden">
            {/* Filters Area */}
            <div className="px-6 md:px-8 py-4 z-20">
              <TopBarFilters 
                selectedEmirate={selectedEmirate}
                onEmirateSelect={(e) => { setSelectedEmirate(e); setSelectedAreas(['All Areas']); setSelectedProject(null); }}
                selectedAreas={selectedAreas}
                onAreaToggle={handleAreaToggle}
              />
              {selectedDeveloperFilter && (
                <div className="mt-3 flex items-center">
                  <span className="text-xs bg-brand-gold/20 text-brand-gold px-3 py-1.5 rounded-lg flex items-center border border-brand-gold/30">
                    Developer: {selectedDeveloperFilter}
                    <button 
                      onClick={() => setSelectedDeveloperFilter(null)}
                      className="ml-2 hover:bg-brand-gold hover:text-black rounded-full w-4 h-4 flex items-center justify-center font-bold"
                    >&times;</button>
                  </span>
                </div>
              )}
            </div>

            {/* Mobile View Toggle */}
            <div className="md:hidden flex justify-center mb-4 px-6 z-20">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1 flex items-center w-full max-w-sm">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-brand-gold text-brand-black shadow-[0_4px_12px_rgba(197,160,89,0.3)]' : 'text-white/50'}`}
                >
                  <List size={16} className="mr-2" /> List
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`flex-1 py-2 rounded-full text-sm font-medium flex items-center justify-center transition-all ${viewMode === 'map' ? 'bg-brand-gold text-brand-black shadow-[0_4px_12px_rgba(197,160,89,0.3)]' : 'text-white/50'}`}
                >
                  <MapIcon size={16} className="mr-2" /> Map
                </button>
              </div>
            </div>

            {/* Content Layout */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Left Column: Project List */}
              <div className={`w-full md:w-[45%] lg:w-[40%] xl:w-[35%] h-full flex flex-col px-6 md:px-8 pb-24 md:pb-8 transition-transform duration-500 ${viewMode === 'map' ? '-translate-x-full absolute md:relative md:transform-none' : 'translate-x-0'}`}>
                <div className="flex justify-between items-center mb-4">
                   <h2 className="font-heading font-black text-sm md:text-lg drop-shadow-md uppercase tracking-widest">
                     {selectedAreas.includes('All Areas') && selectedEmirate === 'All' && !selectedDeveloperFilter ? 'Top Projects' : 'Results'} 
                     <span className="text-white/30 text-[10px] md:text-xs ml-2 font-black bg-black/40 px-2 py-0.5 rounded border border-white/5">({filteredProjects.length})</span>
                   </h2>
                   {user && !isAdmin && (
                     <button
                       onClick={() => {
                         setSelectionMode(!selectionMode);
                         if (selectionMode) setSelectedProjectsForPdf([]);
                       }}
                       className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] md:text-sm font-black transition-colors border uppercase tracking-wider ${selectionMode ? 'bg-brand-gold text-brand-black border-brand-gold' : 'bg-white/5 text-white hover:bg-white/10 border-white/10'}`}
                     >
                       {selectionMode ? 'Cancel' : <><CheckSquare className="w-3.5 h-3.5 md:w-4 md:h-4" /> Selection</>}
                     </button>
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pb-20">
                  <AnimatePresence>
                    {filteredProjects.map((project, idx) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <ProjectCard 
                           project={project} 
                           onViewOnMap={handleViewOnMap} 
                           onViewDetails={setDetailedProject}
                           onQuickView={setQuickViewProject}
                           showSelect={selectionMode}
                           isSelected={selectedProjectsForPdf.some(p => p.id === project.id)}
                           onSelect={toggleProjectSelection}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredProjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-white/10 rounded-2xl mx-1 mt-4">
                      <h3 className="text-lg font-bold text-brand-gold mb-2">No Projects Found</h3>
                      <p className="text-white/50 text-xs leading-relaxed">
                        No projects match your current filters. Clear the filters or add more projects.
                      </p>
                    </div>
                  )}
                </div>
                {selectionMode && selectedProjectsForPdf.length > 0 && (
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <button
                      onClick={() => setShowPdfGenerator(true)}
                      className="w-full py-4 bg-brand-gold text-brand-black font-bold rounded-2xl shadow-[0_8px_32px_rgba(197,160,89,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Presentation size={20} />
                      Generate PDF ({selectedProjectsForPdf.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Map */}
              <div className={`w-full absolute md:relative md:flex-1 h-full p-4 md:pt-0 md:pr-8 md:pl-0 md:pb-8 transition-transform duration-500 ${viewMode === 'list' ? 'translate-x-[100%] md:translate-x-0' : 'translate-x-0'}`}>
                 <MapComponent 
                   projects={filteredProjects} 
                   selectedProject={selectedProject} 
                   onProjectSelect={setSelectedProject} 
                   onQuickView={setQuickViewProject}
                 />
                 
                 {/* Map Card Preview */}
                 <AnimatePresence>
                   {selectedProject && (
                     <motion.div 
                       initial={{ opacity: 0, y: 50, scale: 0.9 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 50, scale: 0.9 }}
                       className="absolute bottom-32 md:bottom-12 left-6 right-6 md:left-1/2 md:-translate-x-1/2 max-w-[320px] mx-auto z-40"
                     >
                       <div className="p-3 bg-black/90 backdrop-blur-2xl border border-brand-gold rounded-2xl shadow-2xl flex items-center cursor-pointer hover:bg-black transition-colors" 
                      onClick={() => {
                        setDetailedProject(selectedProject);
                        setSelectedProject(null);
                      }}
                    >
                         <img src={selectedProject.imageUrl || getProjectImageUrl(selectedProject.name)} className="w-20 h-20 rounded-xl object-cover" alt="" />
                         <div className="ml-4 flex-1 overflow-hidden">
                           <div className="flex items-center gap-1.5">
                             <h4 className="font-bold text-white text-sm whitespace-nowrap overflow-hidden text-ellipsis">{selectedProject.name}</h4>
                             {selectedProject.isVerifiedAgent && (
                               <div title="Verified Agent">
                                 <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" />
                               </div>
                             )}
                           </div>
                           
                           {(() => {
                             const developerData = developers.find(d => 
                               d.name.toLowerCase() === selectedProject.developer.toLowerCase() || 
                               selectedProject.developer.toLowerCase().includes(d.name.toLowerCase())
                             );
                             return (
                               <div className="flex items-center gap-1.5 mt-1">
                                 {developerData && (
                                   <DeveloperLogo 
                                     name={developerData.name} 
                                     logoUrl={developerData.logoUrl} 
                                     className="w-3 h-3 rounded-full bg-[#0b101b] object-contain border border-white/5" 
                                   />
                                 )}
                                 <p className="text-[10px] text-white/60 whitespace-nowrap overflow-hidden text-ellipsis">{selectedProject.developer}</p>
                               </div>
                             );
                           })()}

                           <p className="text-xs text-brand-gold font-bold mt-1">
                          {selectedProject.priceAED ? formatPrice(selectedProject.priceAED) : selectedProject.startingPrice}
                        </p>
                           <div className="flex justify-between items-center mt-2">
                             <span className="text-[10px] text-white/50">{selectedProject.area}</span>
                             <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-white/70">{selectedProject.handover}</span>
                           </div>
                         </div>
                         <a 
                           href={`https://www.google.com/maps/search/?api=1&query=${selectedProject.mapCoordinates.lat},${selectedProject.mapCoordinates.lng}`}
                           target="_blank" 
                           rel="noopener noreferrer"
                           onClick={(e) => e.stopPropagation()}
                           className="w-10 h-10 ml-3 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-black transition-colors"
                           title="Open in Google Maps"
                         >
                           <Navigation size={18} />
                         </a>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      <AuroraBackground />
      {/* Subtle depth effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[150px] pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[150px] pointer-events-none opacity-50"></div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-3 py-2 bg-brand-black/60 backdrop-blur-xl border-b border-white/5 z-20 keep-dark">
          <div className="flex items-center w-10">
            {history.length > 1 ? (
              <button onClick={handleBack} className="text-white/70 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <Menu size={20} className="text-white/70" />
            )}
          </div>
          <img src={LOGO_URL} alt="ProjectX UAE" className="h-10 object-contain" />
          <div className="flex items-center gap-1.5 justify-end w-auto">
            <LanguageSelector />
            <Bell size={18} className="text-white/70" />
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-5 lg:py-6 z-20 keep-dark bg-brand-black/20 backdrop-blur-sm">
          <div className="flex items-center">
            {history.length > 1 && (
              <button 
                onClick={handleBack}
                className="mr-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors flex items-center shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-lg md:text-xl lg:text-3xl luxury-heading mb-1">
                Discover Projects
              </h1>
              <p className="text-[#EDEDED]/50 text-xs flex items-center uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mr-2"></span> Across The UAE
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <PreferenceSelector />
            <div className="flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 w-72 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <Search size={18} className="text-white/50 mr-3" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'projects') setActiveTab('projects');
                }}
                placeholder="Search projects or developers..." 
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-white/50"
              />
            </div>
            <LanguageSelector />
            <button className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-white/10 transition-colors">
              <Bell size={20} className="text-white" />
            </button>
          </div>
        </header>

        {/* Route Content Area */}
        {renderContent()}

      </div>
      
      {/* Mobile Nav */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
      
      {/* Modals placed at root to avoid stacking context issues with header */}
      {showAddProject && <ProjectForm onClose={() => setShowAddProject(false)} />}
      {editingProject && <ProjectForm onClose={() => setEditingProject(null)} projectToEdit={editingProject} />}
      {showAddDev && <AddDeveloperForm onClose={() => setShowAddDev(false)} />}
      {detailedProject && (
        <ProjectDetails 
          project={detailedProject} 
          onClose={() => setDetailedProject(null)} 
          onDownloadPdf={handleDownloadPdf}
        />
      )}
      {showPdfGenerator && <PdfGenerator projects={selectedProjectsForPdf} appUser={appUser} onClose={() => setShowPdfGenerator(false)} />}
      
      {quickViewProject && (
        <QuickView 
          project={quickViewProject} 
          onClose={() => setQuickViewProject(null)}
          onViewFullDetails={(p) => {
            setQuickViewProject(null);
            setDetailedProject(p);
          }}
        />
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

