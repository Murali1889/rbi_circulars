import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [circulars, setCirculars] = useState({});
  const [circularAnalysis, setCircularAnalysis] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Fetch all circulars when component mounts
  useEffect(() => {
    const fetchAllCirculars = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const circularsRef = collection(db, 'circulars');
        const q = query(circularsRef);
        
        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        // Sort documents by date
        const sortedDocs = allDocs.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA; // Most recent first
        });
  
        // Organize documents into pages
        const totalPages = Math.ceil(sortedDocs.length / ITEMS_PER_PAGE);
        const organizedCirculars = {};
        
        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * ITEMS_PER_PAGE;
          organizedCirculars[page] = sortedDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        }
  
        setCirculars(organizedCirculars);
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
      } catch (error) {
        console.error('Error fetching circulars:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllCirculars();
  }, []);

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
    searchCirculars,
    getCircularById,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;