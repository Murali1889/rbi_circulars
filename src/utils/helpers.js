// src/utils/helpers.js
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const searchCirculars = async (searchTerm, maxResults = 5) => {
  try {
    const circularsRef = collection(db, 'circulars');
    const q = query(
      circularsRef,
      where('searchableTitle', '>=', searchTerm.toLowerCase()),
      where('searchableTitle', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      orderBy('searchableTitle'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching circulars:', error);
    return [];
  }
};

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign in popup was blocked. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};