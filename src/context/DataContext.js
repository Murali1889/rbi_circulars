import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, limit } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [circulars, setCirculars] = useState({});
  const [circularAnalysis, setCircularAnalysis] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0)
  const ITEMS_PER_PAGE = 6;

  // Fetch all circulars when component mounts
  useEffect(() => {
    const fetchCirculars = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const circularsRef = collection(db, 'rbi_circulars');
        const q = query(circularsRef);
        
        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by date
        const sortedDocs = allDocs.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        // Calculate total pages
        const calculatedTotalPages = Math.ceil(sortedDocs.length / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        // Organize into pages
        const organizedCirculars = {};
        for (let page = 1; page <= calculatedTotalPages; page++) {
          const startIndex = (page - 1) * ITEMS_PER_PAGE;
          organizedCirculars[page] = sortedDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        }

        setCirculars(organizedCirculars);
      } catch (error) {
        console.error('Error fetching circulars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCirculars();
  }, []);

  const searchCirculars = async (searchTerm) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const circularsRef = collection(db, 'rbi_circulars'); // Updated collection name
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
  
    try {
      const db = getFirestore();
      // Fetch the analysis data
      const analysisRef = doc(db, 'rbi_circular_analysis', id);
      const analysisSnap = await getDoc(analysisRef);
      
      if (!analysisSnap.exists()) {
        return null;
      }
  
      const analysisData = analysisSnap.data();
  
      // Fetch impacted clients details
      let impactedClients = [];
      if (analysisData.impacted_client_ids && analysisData.impacted_client_ids.length > 0) {
        const clientPromises = analysisData.impacted_client_ids.map(clientId => 
          getDoc(doc(db, 'hyperverge_clients', clientId))
        );
        const clientSnapshots = await Promise.all(clientPromises);
        
        impactedClients = clientSnapshots
          .filter(snap => snap.exists())
          .map(snap => ({
            id: snap.id,
            ...snap.data()
          }));
      }
  
      // Fetch impacted products details
      let impactedProducts = [];
      if (analysisData.impacted_product_ids && analysisData.impacted_product_ids.length > 0) {
        const productPromises = analysisData.impacted_product_ids.map(productId =>
          getDoc(doc(db, 'hyperverge_products', productId))
        );
        const productSnapshots = await Promise.all(productPromises);
        
        impactedProducts = productSnapshots
          .filter(snap => snap.exists())
          .map(snap => ({
            id: snap.id,
            ...snap.data()
          }));
      }
  
      // Combine all data
      const enrichedAnalysisData = {
        id: analysisSnap.id,
        ...analysisData,
        impacted_clients: impactedClients,
        impacted_products: impactedProducts
      };
  
      // Cache the enriched analysis data
      setCircularAnalysis(prev => ({
        ...prev,
        [id]: enrichedAnalysisData
      }));
  
      return enrichedAnalysisData;
    } catch (error) {
      console.error('Error fetching circular analysis:', error);
      return null;
    }
  };;

  const value = {
    circulars,
    circularAnalysis,
    loading,
    currentPage,
    setCurrentPage,
    searchCirculars,
    getCircularById,
    totalPages
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;