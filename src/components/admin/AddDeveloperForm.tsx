import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function AddDeveloperForm({ onClose }: Props) {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'developers'), {
        name,
        logoUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      if (err.message) {
        try {
            handleFirestoreError(err, OperationType.CREATE, 'developers');
        } catch(e: any) {
            setError('Failed to add developer: ' + e.message);
        }
      } else {
        setError('Failed to add developer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0A1A2F] border border-brand-gold/30 rounded-[2.5rem] w-full max-w-md p-8 relative mt-10 md:mt-20 mb-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-brand-gold/50 hover:text-brand-gold bg-brand-gold/5 p-2 rounded-full border border-brand-gold/10">
          <X size={20} />
        </button>
        <h2 className="text-3xl luxury-heading mb-6">Create Partner</h2>
        
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/60 mb-2">Full Identity Name</label>
            <input 
              required
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-[#EDEDED] placeholder-[#EDEDED]/20 focus:border-brand-gold outline-none transition-all"
              placeholder="e.g., Emaar Group"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/60 mb-2">Corporate Seal (URL)</label>
            <input 
              type="url" 
              value={logoUrl} 
              onChange={e => setLogoUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-[#EDEDED] placeholder-[#EDEDED]/20 focus:border-brand-gold outline-none transition-all"
              placeholder="Optional: Provide high-res URL"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 luxury-button-primary rounded-xl mt-4"
          >
            {loading ? 'REGISTERING...' : 'REGISTER DEVELOPER'}
          </button>
        </form>
      </div>
    </div>
  );
}
