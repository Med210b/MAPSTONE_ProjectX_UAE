import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Project } from '../data/projects';
import { Developer } from '../data/developers';
import { PROJECTS as localProjects } from '../data/projects';
import { DEVELOPERS as localDevelopers } from '../data/developers';

export function useData() {
  const [projects, setProjects] = useState<Project[]>(localProjects);
  const [developers, setDevelopers] = useState<Developer[]>(localDevelopers);

  useEffect(() => {
    const unsubProjects = onSnapshot(query(collection(db, 'projects')), (snapshot) => {
      const fsProjects: Project[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          emirate: data.emirate,
          area: data.area,
          startingPrice: data.startingPrice,
          handover: data.handover,
          imageUrl: data.imageUrl,
          developer: data.developer,
          beds: data.beds,
          mapCoordinates: data.mapCoordinates || {
            lat: data.mapCoordinatesLat,
            lng: data.mapCoordinatesLng,
          },
          isVerifiedAgent: data.isVerifiedAgent || false,
          priceAED: data.priceAED,
          totalAreaSqFt: data.totalAreaSqFt,
          paymentPlan: data.paymentPlan,
          amenities: data.amenities || [],
          completionYear: data.completionYear,
          developerWebsite: data.developerWebsite,
          unitTypes: data.unitTypes || [],
          galleryUrls: data.galleryUrls || [],
        } as Project;
      });
      const combined = [...localProjects];
      fsProjects.forEach(fsProj => {
        const index = combined.findIndex(p => p.id === fsProj.id);
        if (index !== -1) {
          combined[index] = fsProj;
        } else {
          combined.push(fsProj);
        }
      });
      setProjects(combined);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const unsubDevelopers = onSnapshot(query(collection(db, 'developers')), (snapshot) => {
      const fsDevelopers: Developer[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          logoUrl: data.logoUrl,
        } as Developer;
      });
      
      const combined = [...localDevelopers];
      fsDevelopers.forEach(fsDev => {
        // Try to find by normalized name or ID
        const normalizedFsName = fsDev.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedFsId = fsDev.id.toLowerCase().replace(/[^a-z0-9]/g, '');

        const index = combined.findIndex(d => {
          const normalizedLocalName = d.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normalizedLocalId = d.id.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalizedLocalId === normalizedFsId || normalizedLocalName === normalizedFsName;
        });
        
        if (index !== -1) {
          // Merge: use Firestore data but prioritize local logoUrl if it's an external link (manual override)
          const isExplicitLocalLogo = combined[index].logoUrl && combined[index].logoUrl.startsWith('http');
          
          combined[index] = {
            ...combined[index],
            ...fsDev,
            name: combined[index].name, // Keep the cleaner local name if matched
            logoUrl: (isExplicitLocalLogo) ? combined[index].logoUrl : (fsDev.logoUrl && fsDev.logoUrl.trim() !== "" ? fsDev.logoUrl : combined[index].logoUrl)
          };
        } else {
          combined.push(fsDev);
        }
      });
      setDevelopers(combined);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'developers');
    });

    return () => {
      unsubProjects();
      unsubDevelopers();
    };
  }, []);

  return { projects, developers };
}
