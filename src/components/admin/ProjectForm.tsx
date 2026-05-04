import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useData } from '../../hooks/useData';
import { EMIRATES, EMIRATE_AREAS, Emirate, Project } from '../../data/projects';
import { getProjectImageUrl, slugify } from '../../lib/projectUtils';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

interface Props {
  onClose: () => void;
  projectToEdit?: Project | null;
}

export function ProjectForm({ onClose, projectToEdit }: Props) {
  const { developers } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: projectToEdit?.name || '',
    description: projectToEdit?.description || '',
    emirate: projectToEdit?.emirate || 'Dubai' as Emirate,
    area: projectToEdit?.area || '',
    startingPrice: projectToEdit?.startingPrice || '',
    handover: projectToEdit?.handover || '',
    imageUrl: projectToEdit?.imageUrl || '',
    developer: projectToEdit?.developer || '',
    beds: projectToEdit?.beds || '',
    priceAED: projectToEdit?.priceAED || 0,
    totalAreaSqFt: projectToEdit?.totalAreaSqFt || 0,
    paymentPlan: projectToEdit?.paymentPlan || '',
    mapCoordinatesLat: projectToEdit?.mapCoordinates?.lat ?? 25.2048,
    mapCoordinatesLng: projectToEdit?.mapCoordinates?.lng ?? 55.2708,
    unitTypes: projectToEdit?.unitTypes || [] as { propertyType: string; beds: string; price: string; }[],
    amenities: projectToEdit?.amenities || [] as string[],
    galleryUrlsRaw: projectToEdit?.galleryUrls?.join('\n') || ''
  });

  const [amenityInput, setAmenityInput] = useState('');

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const propertyTypes = ['Apartment', 'Townhouse', 'Villa', 'Penthouse', 'Studio'];
  const bedOptions = ['Studio', '1', '2', '3', '4', '5+', '6', '7'];

  const addUnitType = () => {
    setFormData({
      ...formData,
      unitTypes: [...formData.unitTypes, { propertyType: 'Apartment', beds: '1', price: '' }]
    });
  };

  const updateUnitType = (index: number, field: string, value: string) => {
    const newUnits = [...formData.unitTypes];
    newUnits[index] = { ...newUnits[index], [field]: value };
    // If propertyType is Studio, force beds to 'Studio'
    if (field === 'propertyType' && value === 'Studio') {
      newUnits[index].beds = 'Studio';
    } else if (field === 'propertyType' && newUnits[index].beds === 'Studio' && value !== 'Studio') {
      newUnits[index].beds = '1';
    }
    setFormData({ ...formData, unitTypes: newUnits });
  };

  const removeUnitType = (index: number) => {
    setFormData({
      ...formData,
      unitTypes: formData.unitTypes.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.area) throw new Error('Please select an Area');
      if (!formData.developer) throw new Error('Please select a Developer');

      // Auto-generate startingPrice and beds string if unitTypes are provided and the user didn't enter them
      let finalStartingPrice = formData.startingPrice;
      let finalBeds = formData.beds;

      if (formData.unitTypes.length > 0) {
        if (!finalStartingPrice) {
           finalStartingPrice = formData.unitTypes[0].price; // Simplified, grab first
        }
        if (!finalBeds) {
           // Extract unique property types
           const types = Array.from(new Set(formData.unitTypes.map(u => u.propertyType)));
           const bedNums = Array.from(new Set(formData.unitTypes.map(u => u.beds))).filter((b): b is string => b !== 'Studio');
           
           let bedText = bedNums.length ? `${Math.min(...bedNums.map((b: string) => parseInt(b) || 0))}-${Math.max(...bedNums.map((b: string) => parseInt(b) || 0))} Bed` : '';
           finalBeds = [bedText, ...types].filter(Boolean).join(', ');
        }
       }

      const { mapCoordinatesLat, mapCoordinatesLng, galleryUrlsRaw, ...otherData } = formData;
      const projectData = {
        ...otherData,
        imageUrl: formData.imageUrl || getProjectImageUrl(formData.name),
        galleryUrls: galleryUrlsRaw.split('\n').map(url => url.trim()).filter(Boolean),
        startingPrice: finalStartingPrice,
        beds: finalBeds,
        mapCoordinates: {
          lat: Number(mapCoordinatesLat),
          lng: Number(mapCoordinatesLng)
        }
      };

      if (projectToEdit) {
        await updateDoc(doc(db, 'projects', projectToEdit.id), {
          ...projectData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          isVerifiedAgent: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      onClose();
    } catch (err: any) {
      if (err instanceof Error && err.name === 'FirebaseError') {
        try {
            handleFirestoreError(err, projectToEdit ? OperationType.UPDATE : OperationType.CREATE, 'projects');
        } catch(e: any) {
            setError(`Failed to ${projectToEdit ? 'update' : 'add'} project: ` + e.message);
        }
      } else {
        setError(err.message || `Failed to ${projectToEdit ? 'update' : 'add'} project.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const areas = EMIRATE_AREAS[formData.emirate]?.filter(a => a !== 'All Areas') || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0A1A2F] border border-brand-gold/30 rounded-[2.5rem] w-full max-w-3xl p-6 md:p-12 relative mt-4 md:mt-12 mb-20 md:mb-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-brand-gold/50 hover:text-brand-gold bg-brand-gold/5 p-2.5 rounded-full hover:bg-brand-gold/10 transition-all z-10 border border-brand-gold/10 shadow-lg">
          <X size={20} />
        </button>
        <h2 className="text-2xl md:text-4xl luxury-heading mb-4">
          {projectToEdit ? 'Refine ' : 'Curate '}<span className="">{projectToEdit ? 'Property' : 'New Listing'}</span>
        </h2>
        <p className="text-[#EDEDED]/40 text-sm mb-8 pb-6 border-b border-brand-gold/10 font-medium italic opacity-80">
          {projectToEdit ? 'Update the prestigious details of this Dubai asset.' : 'Enter the definitive parameters for this new high-value property opportunity.'}
        </p>
        
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center"><X size={16} className="mr-2" />{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Section: Basic Info */}
          <div>
            <h3 className="text-brand-gold font-bold mb-4 border-b border-brand-gold/10 pb-2 text-xs uppercase tracking-[0.2em]">Asset Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Project Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Developer</label>
                <select required value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors">
                  <option value="">Select Developer</option>
                  {developers.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Handover Date</label>
                <input required type="text" value={formData.handover} onChange={e => setFormData({...formData, handover: e.target.value})} placeholder="e.g., Q4 2026" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div>
            <h3 className="text-brand-gold font-bold mb-4 border-b border-brand-gold/10 pb-2 text-xs uppercase tracking-[0.2em]">Geographic Positioning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Emirate</label>
                <select required value={formData.emirate} onChange={e => setFormData({...formData, emirate: e.target.value as Emirate, area: ''})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors">
                  {EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Area</label>
                <select required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors" disabled={!areas.length}>
                  <option value="">Select Area</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Map Coordinates (Latitude & Longitude)</label>
                <p className="text-[10px] md:text-xs text-white/40 mb-2 md:mb-3">These numbers pinpoint the project on the map. You can get them by right-clicking the location on Google Maps.</p>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-medium text-white/50 mb-1">Latitude (e.g., 25.2048)</label>
                    <input required type="number" step="any" value={formData.mapCoordinatesLat} onChange={e => setFormData({...formData, mapCoordinatesLat: parseFloat(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-medium text-white/50 mb-1">Longitude (e.g., 55.2708)</label>
                    <input required type="number" step="any" value={formData.mapCoordinatesLng} onChange={e => setFormData({...formData, mapCoordinatesLng: parseFloat(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Pricing & Units */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h3 className="text-white font-semibold text-sm">Unit Types & Default Pricing</h3>
              <button 
                type="button" 
                onClick={addUnitType}
                className="text-xs bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full hover:bg-brand-gold/30 transition-colors flex items-center"
              >
                <span className="font-bold mr-1">+</span> Add Unit Type
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
               <div>
                  <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">
                    Label: Beds <span className="text-[10px] text-brand-gold opacity-80">(Auto if empty)</span>
                  </label>
                  <input type="text" value={formData.beds} onChange={e => setFormData({...formData, beds: e.target.value})} placeholder="e.g. 1-4 Bed Apartments" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">
                    Label: Starting Price <span className="text-[10px] text-brand-gold opacity-80">(Auto if empty)</span>
                  </label>
                  <input type="text" value={formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: e.target.value})} placeholder="e.g., AED 1,200,000" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">
                  Base Price in AED <span className="text-[10px] text-brand-gold opacity-80">(Numeric, for conversions)</span>
                </label>
                <input required type="number" value={formData.priceAED || ''} onChange={e => setFormData({...formData, priceAED: Number(e.target.value)})} placeholder="e.g. 1200000" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">
                  Total Area (Sq/ft) <span className="text-[10px] text-brand-gold opacity-80">(Numeric, for conversions)</span>
                </label>
                <input required type="number" value={formData.totalAreaSqFt || ''} onChange={e => setFormData({...formData, totalAreaSqFt: Number(e.target.value)})} placeholder="e.g. 1200" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">
                  Payment Plan <span className="text-[10px] text-brand-gold opacity-80">(e.g. 70/30)</span>
                </label>
                <input required type="text" value={formData.paymentPlan} onChange={e => setFormData({...formData, paymentPlan: e.target.value})} placeholder="e.g. 70/30" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-brand-gold outline-none transition-colors" />
              </div>
            </div>

            {formData.unitTypes.length > 0 ? (
              <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                {formData.unitTypes.map((unit, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 bg-black/40 p-3 rounded-xl border border-white/5 relative items-center hover:border-white/10 transition-colors">
                    <div className="col-span-12 md:col-span-4">
                      <select 
                        value={unit.propertyType} 
                        onChange={(e) => updateUnitType(index, 'propertyType', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs md:text-sm text-white focus:border-brand-gold outline-none"
                      >
                        {propertyTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <select 
                        value={unit.beds} 
                        onChange={(e) => updateUnitType(index, 'beds', e.target.value)}
                        disabled={unit.propertyType === 'Studio'}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs md:text-sm text-white focus:border-brand-gold outline-none disabled:opacity-50"
                      >
                        {bedOptions.map(bo => <option key={bo} value={bo}>{bo === 'Studio' ? bo : `${bo} Bed`}</option>)}
                      </select>
                    </div>
                    <div className="col-span-10 md:col-span-4">
                      <input 
                        type="text" 
                        value={unit.price} 
                        onChange={(e) => updateUnitType(index, 'price', e.target.value)}
                        placeholder="Price (e.g. AED 1M)"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs md:text-sm text-white focus:border-brand-gold outline-none"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      <button 
                        type="button" 
                        onClick={() => removeUnitType(index)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/20 p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <p className="text-white/40 text-sm mb-2">No specific unit types defined.</p>
                <p className="text-white/30 text-xs">Consider adding units so they appear directly on the project details.</p>
              </div>
            )}
          </div>

          {/* Section: Media Info */}
          <div>
            <h3 className="text-white font-semibold mb-3 border-b border-white/10 pb-2 text-sm">Media & Assets</h3>
            
            <div className="mb-4">
              <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Main Image URL</label>
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" />
              <p className="text-[10px] md:text-xs text-white/40 mt-1">Paste a link here, or leave empty to use the folder path below.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Gallery Image URLs (One per line)</label>
              <textarea 
                value={formData.galleryUrlsRaw} 
                onChange={e => setFormData({...formData, galleryUrlsRaw: e.target.value})} 
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" 
              />
              <p className="text-[10px] md:text-xs text-white/40 mt-1">Add additional photos by pasting their URLs here. Put each link on a new line.</p>
            </div>

            <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-xl">
              <p className="text-xs md:text-sm text-brand-gold/90 font-medium">Alternative: Local Folder Linking</p>
              <p className="text-[11px] md:text-xs text-white/60 mt-1 leading-relaxed">
                <strong>Option B (Local Folder):</strong> 
                <br />
                1. Create a folder in <code className="bg-black/40 px-1.5 py-0.5 rounded text-brand-gold">public/images/projects/</code>
                <br />
                2. Name it exactly as the project name: <code className="bg-black/40 px-1.5 py-0.5 rounded text-white font-bold">{formData.name || "Project Name"}</code>
                <br />
                3. Primary Photo: Name it <code className="bg-black/40 px-1.5 py-0.5 rounded text-brand-gold">main.png</code>
                <br />
                4. Gallery Photos: Name them <code className="bg-black/40 px-1.5 py-0.5 rounded text-brand-gold">1.png</code>, <code className="bg-black/40 px-1.5 py-0.5 rounded text-brand-gold">2.png</code>, etc.
              </p>
            </div>
          </div>

          {/* Section: Amenities */}
          <div>
            <h3 className="text-white font-semibold mb-3 border-b border-white/10 pb-2 text-sm">Amenities</h3>
            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-medium text-white/70 mb-1">Project Amenities</label>
              <p className="text-[10px] md:text-xs text-white/40 mb-2">Add notable amenities (e.g., Gym, Pool, Spa, Beach Access). Press enter or click Add.</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={amenityInput} 
                  onChange={e => setAmenityInput(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                  placeholder="e.g. Swimming Pool" 
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-white/30 focus:border-brand-gold outline-none transition-colors" 
                />
                <button type="button" onClick={handleAddAmenity} className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 rounded-xl transition-colors">
                  Add
                </button>
              </div>
              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  {formData.amenities.map(amenity => (
                    <span key={amenity} className="flex items-center gap-1 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-white/80">
                      {amenity}
                      <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="text-white/40 hover:text-red-400 focus:outline-none ml-1">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-brand-gold/10">
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-5 rounded-2xl luxury-button-primary transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-brand-blue-dark border-t-transparent rounded-full animate-spin"></div>
                  <span>{projectToEdit ? 'ARCHIVING...' : 'PUBLISHING...'}</span>
                </div>
              ) : (
                projectToEdit ? 'COMMIT UPDATES' : 'PUBLISH LISTING'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
