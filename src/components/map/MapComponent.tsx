import { useEffect, useState } from 'react';
import { Project } from '../../data/projects';
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from 'react-leaflet';
// @ts-ignore: react-leaflet-cluster might miss declaration in some environments
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Layers, Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapComponentProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onQuickView?: (project: Project) => void;
}

// Component to handle map view updates when selected project changes
function MapController({ selectedProject }: { selectedProject: Project | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedProject && 
        selectedProject.mapCoordinates && 
        selectedProject.mapCoordinates.lat !== undefined && 
        selectedProject.mapCoordinates.lng !== undefined) {
      map.flyTo([selectedProject.mapCoordinates.lat, selectedProject.mapCoordinates.lng], 14, {
        duration: 1.5
      });
    }
  }, [selectedProject, map]);
  return null;
}

function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="absolute top-6 right-6 z-[400] flex flex-col gap-2">
      <button 
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-lg"
      >
        <Plus size={20} />
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-lg"
      >
        <Minus size={20} />
      </button>
    </div>
  );
}

const createCustomIcon = (project: Project, isSelected: boolean) => {
  const bedsLower = project.beds.toLowerCase();
  const isVilla = bedsLower.includes('villa');
  const isTownhouse = bedsLower.includes('townhouse') || bedsLower.includes('town house');
  const isPenthouse = bedsLower.includes('penthouse');
  
  let iconSvg = '';
  let accentColor = '#C8A96A'; // Luxury Brand Gold
  let accentClass = 'border-[#C8A96A] text-[#C8A96A] shadow-[0_4px_25px_rgba(200,169,106,0.4)]';
  let dotClass = 'bg-[#C8A96A] shadow-[0_0_10px_#C8A96A]';
  let markerBorderClass = 'border-white/20';

  if (isVilla) {
    accentColor = '#10B981'; // Emerald 500
    accentClass = 'border-[#10B981] text-[#10B981] shadow-[0_4px_25px_rgba(16,185,129,0.4)]';
    dotClass = 'bg-[#10B981] shadow-[0_0_10px_#10B981]';
    markerBorderClass = 'border-[#10B981]/40';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  } else if (isTownhouse) {
    accentColor = '#3B82F6'; // Blue 500
    accentClass = 'border-[#3B82F6] text-[#3B82F6] shadow-[0_4px_25px_rgba(59,130,246,0.4)]';
    dotClass = 'bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]';
    markerBorderClass = 'border-[#3B82F6]/40';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-7 9 7v12"/><path d="M9 21V12h6v9"/></svg>`;
  } else if (isPenthouse) {
    accentColor = '#8B5CF6'; // Violet 500
    accentClass = 'border-[#8B5CF6] text-[#8B5CF6] shadow-[0_4px_25px_rgba(139,92,246,0.4)]';
    dotClass = 'bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.4)]';
    markerBorderClass = 'border-[#8B5CF6]/40';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M22 22H2"/><path d="M17 12H7"/><path d="M22 7H2"/><path d="M12 2 2 7l10 5 10-5-10-5z"/></svg>`;
  } else {
    // Apartment
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;
  }

  let html = '';
  
  if (isSelected) {
    html = `
      <div class="flex flex-col items-center group cursor-pointer w-48 -ml-24 -mt-16 z-50 relative">
        <div class="bg-[#0A1A2F]/95 backdrop-blur-md text-white border ${accentClass} rounded-2xl p-3 flex flex-col gap-1 items-center transform scale-110 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <span class="text-[10px] luxury-heading !text-transparent !bg-clip-text text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 flex items-center justify-center gap-1">
            ${project.name}
            ${project.isVerifiedAgent ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>' : ''}
          </span>
          <div class="flex items-center gap-1.5 filter drop-shadow">
            <span class="text-white/70">${iconSvg}</span>
            <span class="text-sm luxury-heading !text-transparent !bg-clip-text shrink-0">${project.startingPrice}</span>
          </div>
        </div>
        <div class="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[${accentColor}] mt-[-1px]"></div>
        <div class="w-2 h-2 rounded-full mt-1 ${dotClass} animate-pulse"></div>
      </div>
    `;
  } else {
    const dotBaseClass = dotClass.split(' ')[0];
    html = `
      <div class="flex flex-col items-center group cursor-pointer w-24 -ml-12 -mt-8 z-40 relative opacity-90 hover:opacity-100 transition-all hover:scale-110">
        <div class="bg-[#1A1A1A] text-white/70 border ${markerBorderClass} shadow-lg rounded-full p-2 flex items-center justify-center hover:border-white hover:bg-black transition-colors">
          <span class="group-hover:text-white transition-colors" style="color: ${accentColor}">
            ${iconSvg}
          </span>
        </div>
        <div class="w-1.5 h-1.5 rounded-full mt-1 bg-white/40 group-hover:${dotBaseClass}"></div>
      </div>
    `;
  }

  return L.divIcon({
    html,
    className: '', 
    iconSize: [0, 0], 
    iconAnchor: [0, 0], 
  });
};

const createClusterCustomIcon = (cluster: any) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-12 h-12 bg-[#0A1A2F]/90 backdrop-blur-xl border-2 border-[#C8A96A]/40 rounded-2xl text-[#C8A96A] font-black text-sm shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(200,169,106,0.2)] transform hover:scale-110 transition-all duration-300">
        <span class="relative z-10">${cluster.getChildCount()}</span>
        <div class="absolute inset-0 bg-gradient-to-br from-[#C8A96A]/10 to-transparent rounded-2xl"></div>
      </div>
    `,
    className: 'custom-marker-cluster',
    iconSize: L.point(48, 48, true),
  });
};

type MapStyle = 'Dark' | 'Light' | 'Satellite';

export function MapComponent({ projects, selectedProject, onProjectSelect, onQuickView }: MapComponentProps) {
  // Center of UAE (approx Dubai)
  const defaultCenter: [number, number] = [25.10, 55.20];
  const [mapStyle, setMapStyle] = useState<MapStyle>('Satellite');

  const mapUrls: Record<MapStyle, string> = {
    Dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    Light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const mapAttributions: Record<MapStyle, string> = {
    Dark: '&copy; CARTO',
    Light: '&copy; CARTO',
    Satellite: '&copy; Esri',
  };

  return (
    <div className="relative w-full h-full bg-[#111111] overflow-hidden rounded-xl md:rounded-none lg:rounded-xl border border-white/5 map-grid-bg">
      {/* Map Layer Switcher */}
      <div className="absolute top-6 left-6 z-[400] flex gap-2 p-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
        <div className="hidden sm:flex items-center px-3 border-r border-white/10 mr-1 text-white/50">
          <Layers size={16} />
        </div>
        <button 
          onClick={() => setMapStyle('Dark')} 
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${mapStyle === 'Dark' ? 'bg-[#C8A96A] text-brand-blue-dark' : 'text-white/70 hover:bg-white/10'}`}
        >
          Dark Mode
        </button>
        <button 
          onClick={() => setMapStyle('Light')} 
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${mapStyle === 'Light' ? 'bg-[#C8A96A] text-brand-blue-dark' : 'text-white/70 hover:bg-white/10'}`}
        >
          Light Mode
        </button>
        <button 
          onClick={() => setMapStyle('Satellite')} 
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${mapStyle === 'Satellite' ? 'bg-[#C8A96A] text-brand-blue-dark' : 'text-white/70 hover:bg-white/10'}`}
        >
          Satellite
        </button>
      </div>

      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        className="w-full h-full z-10 !bg-transparent"
        zoomControl={false}
      >
        <TileLayer
          key={mapStyle} // Forces re-render of TileLayer when source changes
          url={mapUrls[mapStyle]}
          attribution={mapAttributions[mapStyle]}
        />
        
        <CustomZoomControl />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          showCoverageOnHover={false}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
        >
          {projects
            .filter(project => 
              project.mapCoordinates && 
              project.mapCoordinates.lat !== undefined && 
              project.mapCoordinates.lng !== undefined
            )
            .map((project) => (
            <Marker
              key={project.id}
              position={[project.mapCoordinates.lat, project.mapCoordinates.lng]}
              icon={createCustomIcon(project, selectedProject?.id === project.id)}
              eventHandlers={{
                click: () => {
                  onProjectSelect(project);
                  if (onQuickView) onQuickView(project);
                }
              }}
            >
              <Tooltip 
                direction="top" 
                offset={[0, -32]} 
                opacity={1} 
                className="custom-map-tooltip"
              >
                <div className="bg-[#0A1A2F]/95 backdrop-blur-xl border border-brand-gold/20 rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[180px]">
                  <p className="text-[10px] luxury-heading !text-transparent !bg-clip-text mb-1.5">{project.developer}</p>
                  <p className="text-base luxury-heading !text-transparent !bg-clip-text mb-3 leading-tight tracking-normal">{project.name}</p>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-brand-gold/10">
                    <p className="text-sm font-bold text-brand-gold">{project.startingPrice}</p>
                    <p className="text-[10px] font-bold text-[#EDEDED]/50 uppercase tracking-widest">{project.area}</p>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>

        <MapController selectedProject={selectedProject} />
      </MapContainer>
    </div>
  );
}
