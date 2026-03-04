import { db } from './firebase';
import { 
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs,
  orderBy, query, serverTimestamp,
  deleteDoc, where, Timestamp,
  limit
} from 'firebase/firestore';

export interface UserData {
  charms: number;
  imageGenCount: number;
  imageAdsWatched: number;
  imageLastDate: string;
  chatHistory: any[];
  createdAt?: any;
  lastSeen?: any;
}

const DEFAULT_USER_DATA: UserData = {
  charms: 11,
  imageGenCount: 0,
  imageAdsWatched: 0,
  imageLastDate: new Date().toDateString(),
  chatHistory: []
};

const DEV_USER_ID = 'dev-preview-123';

// Local storage fallback helpers
const getLocalData = (uid: string): UserData => {
  try {
    const local = localStorage.getItem(`user_${uid}`);
    if (local) {
      return { ...DEFAULT_USER_DATA, ...JSON.parse(local) };
    }
  } catch (e) {
    console.warn('Error reading from localStorage', e);
  }
  return DEFAULT_USER_DATA;
};

const saveLocalData = (uid: string, data: Partial<UserData>) => {
  try {
    const current = getLocalData(uid);
    const updated = { ...current, ...data };
    localStorage.setItem(`user_${uid}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving to localStorage', e);
  }
};

// Load user data from Firestore
export const loadUserData = async (
  uid: string
): Promise<UserData> => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      // User exists — return their data
      const data = snap.data() as UserData;
      
      // Update lastSeen
      await updateDoc(ref, {
        lastSeen: serverTimestamp()
      });
      
      saveLocalData(uid, data);
      return data;
    } else {
      // New user — create document with defaults
      const newData = {
        ...DEFAULT_USER_DATA,
        imageLastDate: new Date().toDateString(),
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      };
      await setDoc(ref, newData);
      saveLocalData(uid, newData);
      return DEFAULT_USER_DATA;
    }
  } catch (error: any) {
    const isOffline = error?.code === 'unavailable' || error?.message?.includes('offline');
    const isPermissionDenied = error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions');
    
    if (isPermissionDenied || isOffline) {
      console.warn(`Firestore ${isOffline ? 'offline' : 'permission denied'}. Falling back to localStorage.`);
    } else {
      console.error('loadUserData error:', error);
    }
    return getLocalData(uid);
  }
};

// Save charms to Firestore
export const saveCharms = async (
  uid: string, 
  charms: number
): Promise<void> => {
  saveLocalData(uid, { charms });
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { charms });
  } catch (error: any) {
    if (error?.code !== 'permission-denied' && !error?.message?.includes('Missing or insufficient permissions')) {
      console.error('saveCharms error:', error);
    }
  }
};

// Save image generation data
// Load image generation data from Firestore
export const loadImageGenData = async (
  uid: string
): Promise<{
  genCount: number;
  adsWatched: number;
  lastDate: string;
}> => {
  const DEFAULT = {
    genCount: 0,
    adsWatched: 0,
    lastDate: new Date().toDateString()
  };
  
  if (!uid) return DEFAULT;

  if (uid === DEV_USER_ID) {
    const localData = JSON.parse(localStorage.getItem('dev_image_gen_data') || JSON.stringify(DEFAULT));
    const today = new Date().toDateString();
    if (localData.lastDate !== today) {
      const resetData = { genCount: 0, adsWatched: 0, lastDate: today };
      localStorage.setItem('dev_image_gen_data', JSON.stringify(resetData));
      return resetData;
    }
    return localData;
  }
  
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    
    if (!snap.exists()) return DEFAULT;
    
    const data = snap.data();
    const today = new Date().toDateString();
    const savedDate = data.imageLastDate;
    
    // New day → reset counts
    if (savedDate !== today) {
      await updateDoc(ref, {
        imageGenCount: 0,
        imageAdsWatched: 0,
        imageLastDate: today
      });
      return { 
        genCount: 0, 
        adsWatched: 0, 
        lastDate: today 
      };
    }
    
    // Same day → return saved counts
    return {
      genCount: data.imageGenCount ?? 0,
      adsWatched: data.imageAdsWatched ?? 0,
      lastDate: savedDate ?? today
    };
  } catch (error) {
    console.error('loadImageGenData error:', error);
    return DEFAULT;
  }
};

// Save image generation count to Firestore
export const saveImageGenData = async (
  uid: string,
  genCount: number,
  adsWatched: number,
  lastDate: string
): Promise<void> => {
  if (!uid) return;

  if (uid === DEV_USER_ID) {
    localStorage.setItem('dev_image_gen_data', JSON.stringify({
      genCount,
      adsWatched,
      lastDate
    }));
    return;
  }
  
  try {
    const ref = doc(db, 'users', uid);
    // Use setDoc with merge to handle 
    // case where doc doesn't exist yet
    await setDoc(ref, {
      imageGenCount: genCount,
      imageAdsWatched: adsWatched,
      imageLastDate: lastDate
    }, { merge: true });
  } catch (error) {
    console.error('saveImageGenData error:', error);
  }
};

// Save chat history
export const saveChatHistory = async (
  uid: string,
  chatHistory: any[]
): Promise<void> => {
  // Keep last 50 messages only
  const trimmed = chatHistory.slice(-50);
  saveLocalData(uid, { chatHistory: trimmed });
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { 
      chatHistory: trimmed 
    });
  } catch (error: any) {
    if (error?.code !== 'permission-denied' && !error?.message?.includes('Missing or insufficient permissions')) {
      console.error('saveChatHistory error:', error);
    }
  }
};

// Save a chat session to Firestore
export const saveChatSession = async (
  uid: string,
  sessionId: string,
  messages: any[]
): Promise<void> => {
  if (!uid || !sessionId || !messages || messages.length === 0) return;

  try {
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg?.text?.slice(0, 30) || 'New Chat';

    const ref = doc(db, 'users', uid, 'chatHistory', sessionId);
    await setDoc(ref, {
      sessionId,
      title,
      messages,
      updatedAt: serverTimestamp(),
      createdAt: messages.length <= 2 ? serverTimestamp() : undefined // Only set createdAt on first save
    }, { merge: true });
  } catch (error) {
    console.error('saveChatSession error:', error);
  }
};

// Load all chat sessions and delete those older than 7 days
export const loadChatHistory = async (
  uid: string
): Promise<any[]> => {
  if (!uid) return [];

  try {
    const historyRef = collection(db, 'users', uid, 'chatHistory');
    
    // 1. Delete old chats (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const oldQuery = query(historyRef, where('updatedAt', '<', Timestamp.fromDate(sevenDaysAgo)));
    const oldSnap = await getDocs(oldQuery);
    
    const deletePromises = oldSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    // 2. Fetch remaining chats
    const q = query(historyRef, orderBy('updatedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('loadChatHistory error:', error);
    return [];
  }
};

// Delete a specific chat session
export const deleteChatSession = async (
  uid: string,
  sessionId: string
): Promise<void> => {
  if (!uid || !sessionId) return;
  try {
    const ref = doc(db, 'users', uid, 'chatHistory', sessionId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('deleteChatSession error:', error);
  }
};

// Fix charms — always return valid number
export const getValidCharms = (val: any): number => {
  const n = parseInt(val);
  return isNaN(n) ? 11 : Math.max(0, n);
};
