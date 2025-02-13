import React, { createContext, useContext, useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter, doc, getDoc } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [circulars, setCirculars] = useState({});
  const [circularAnalysis, setCircularAnalysis] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const fetchCirculars = async (page = 1) => {
    // If we already have this page's data, don't fetch again
    if (circulars[page]) return;

    setLoading(true);
    try {
      const db = getFirestore();
      const circularsRef = collection(db, 'circulars');
      
      let q;
      if (page === 1) {
        q = query(circularsRef, orderBy('date', 'desc'), limit(ITEMS_PER_PAGE));
      } else {
        // Use the last document from the previous page to paginate
        q = query(
          circularsRef,
          orderBy('date', 'desc'),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const newCirculars = {};
      const docs = [];

      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      
      newCirculars[page] = docs;
      setCirculars(prev => ({ ...prev, ...newCirculars }));
    } catch (error) {
      console.error('Error fetching circulars:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCirculars = async (searchTerm) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const circularsRef = collection(db, 'circulars');
      const q = query(circularsRef, orderBy('title'), limit(10));
      const snapshot = await getDocs(q);
      
      const results = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({ id: doc.id, ...data });
        }
      });

      return results;
    } catch (error) {
      console.error('Error searching circulars:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCircularById = async (id) => {
    // Check if we already have the analysis in cache
    if (circularAnalysis[id]) {
      return circularAnalysis[id];
    }

    // If not found in cache, fetch from circular_analysis collection
    try {
      const db = getFirestore();
      const docRef = doc(db, 'circular_analysis', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const analysisData = { id: docSnap.id, ...docSnap.data() };
        console.log(analysisData)
        // Cache the analysis data
        setCircularAnalysis(prev => ({
          ...prev,
          [id]: analysisData
        }));
        return analysisData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching circular analysis:', error);
      return null;
    }
  };

  const value = {
    circulars,
    circularAnalysis,
    loading,
    currentPage,
    setCurrentPage,
    fetchCirculars,
    searchCirculars,
    getCircularById,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};