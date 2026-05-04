import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';

export interface AppUser {
  displayName: string;
  email: string;
  reraNumber: string;
  companyName: string;
  phoneNumber: string;
  photoURL: string;
  isVerifiedAgent?: boolean;
  favorites?: string[];
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (projectId: string) => Promise<void>;
  updateAppUser: (data: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const updateAppUser = (data: Partial<AppUser>) => {
    setAppUser(prev => prev ? { ...prev, ...data } : (data as AppUser));
  };

  useEffect(() => {
    let unsubscribeUser: () => void;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // fetch app user
        unsubscribeUser = onSnapshot(doc(db, 'users', currentUser.uid), (docSn) => {
          if (docSn.exists()) {
             setAppUser(docSn.data() as AppUser);
          } else {
             setAppUser(null);
          }
        }, (error) => {
          try {
             handleFirestoreError(error, OperationType.GET, 'users');
          } catch(e) {
             console.error("Failed to fetch user snapshot", e);
          }
        });

        // check if admin
        const adminEmails = ['mohamedbentaher66@gmail.com', 'contact@mapstonegroup.com'];
        if (currentUser.email && adminEmails.includes(currentUser.email)) {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          } catch (error) {
            try {
              handleFirestoreError(error, OperationType.GET, 'admins');
            } catch(e) {
              // handle error caught above
              setIsAdmin(false);
            }
          }
        }
      } else {
        setIsAdmin(false);
        setAppUser(null);
        if (unsubscribeUser) unsubscribeUser();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists, if not create it
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const defaultData: AppUser = {
        displayName: user.displayName || '',
        email: user.email || '',
        reraNumber: '',
        companyName: '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        isVerifiedAgent: false,
        favorites: [],
      };

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          ...defaultData,
          createdAt: new Date().toISOString()
        });
        setAppUser(defaultData);
      } else {
        setAppUser(userDoc.data() as AppUser);
      }
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const toggleFavorite = async (projectId: string) => {
    if (!user || !appUser) return;
    
    const favorites = appUser.favorites || [];
    const isFavorite = favorites.includes(projectId);
    const newFavorites = isFavorite 
      ? favorites.filter(id => id !== projectId)
      : [...favorites, projectId];

    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { 
        favorites: newFavorites,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, appUser, isAdmin, loading, loginWithGoogle, loginWithEmail, logout, toggleFavorite, updateAppUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
