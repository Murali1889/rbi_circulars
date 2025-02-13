// src/services/firebaseService.js
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';

export class FirebaseService {
  static async getCirculars(page = 1, itemsPerPage = 6, lastDoc = null) {
    try {
      const circularsRef = collection(db, 'circulars');
      let q = query(
        circularsRef,
        orderBy('date', 'desc'),
        limit(itemsPerPage)
      );

      if (lastDoc && page > 1) {
        q = query(
          circularsRef,
          orderBy('date', 'desc'),
          startAfter(lastDoc),
          limit(itemsPerPage)
        );
      }

      const snapshot = await getDocs(q);
      const circulars = [];
      
      snapshot.forEach((doc) => {
        circulars.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        circulars,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error fetching circulars:', error);
      throw error;
    }
  }

  static async getCircularById(id) {
    try {
      const circularRef = doc(db, 'circulars', id);
      const circularDoc = await getDoc(circularRef);

      if (!circularDoc.exists()) {
        return null;
      }

      // Update view count
      await updateDoc(circularRef, {
        views: increment(1),
        lastViewed: serverTimestamp()
      });

      return {
        id: circularDoc.id,
        ...circularDoc.data()
      };
    } catch (error) {
      console.error('Error fetching circular:', error);
      throw error;
    }
  }

  static async searchCirculars(searchTerm) {
    try {
      const circularsRef = collection(db, 'circulars');
      const q = query(
        circularsRef,
        where('searchableTitle', '>=', searchTerm.toLowerCase()),
        where('searchableTitle', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        orderBy('searchableTitle'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching circulars:', error);
      throw error;
    }
  }

  static async getUserCirculars(userId) {
    try {
      const circularsRef = collection(db, 'circulars');
      const q = query(
        circularsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user circulars:', error);
      throw error;
    }
  }
}