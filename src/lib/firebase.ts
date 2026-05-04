import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Test Firestore connection & Enable offline persistence if possible
import { doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';

const setupFirestore = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Firestore: Offline persistence enabled.');
  } catch (err: any) {
    console.warn('Firestore Persistence: ', err.code);
  }
  
  try {
    // Attempt a physical reach to server
    await getDocFromServer(doc(db, '_connection_test_', 'check'));
    console.log('Firestore: Successfully reached backend server.');
  } catch (error: any) {
    console.warn('Firestore Connectivity: ', error.message);
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error('CRITICAL: Firestore is unreachable.');
    }
  }
};
setupFirestore();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
