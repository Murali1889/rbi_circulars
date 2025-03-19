import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, limit, startAfter, where } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [circulars, setCirculars] = useState({ rbi: {}, sebi: {} });
  const [circularAnalysis, setCircularAnalysis] = useState({ rbi: {}, sebi: {} });
  const [products, setProducts] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPageState] = useState({ rbi: 1, sebi: 1 });
  const [totalPages, setTotalPages] = useState({ rbi: 0, sebi: 0 });
  const [lastDocs, setLastDocs] = useState({ rbi: null, sebi: null });
  const ITEMS_PER_PAGE = 6;

  const db = getFirestore();

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const productsSnap = await getDocs(collection(db, 'hyperverge_products'));
        const productsData = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);

        const clientsSnap = await getDocs(collection(db, 'hyperverge_clients'));
        const categories = new Set();
        clientsSnap.docs.forEach(doc => {
          if (doc.data().client_category) {
            categories.add(doc.data().client_category);
          }
        });
        setClientCategories(Array.from(categories));
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  // Set current page for specific type
  const setCurrentPage = (type, page) => {
    setCurrentPageState(prev => ({ ...prev, [type]: page }));
  };

  // Fetch circulars by page
  const getCircularsByPage = async (type, page) => {
    setLoading(true);
    try {
      const collectionName = `${type}_circulars`;
      let q = query(
        collection(db, collectionName),
        orderBy('date', 'desc'),
        limit(ITEMS_PER_PAGE)
      );

      if (page > 1 && lastDocs[type]) {
        q = query(
          collection(db, collectionName),
          orderBy('date', 'desc'),
          startAfter(lastDocs[type]),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update last document for pagination
      setLastDocs(prev => ({
        ...prev,
        [type]: snapshot.docs[snapshot.docs.length - 1]
      }));

      // Get total count for pagination
      const totalSnap = await getDocs(collection(db, collectionName));
      const totalCount = totalSnap.size;
      const calculatedTotalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

      setTotalPages(prev => ({
        ...prev,
        [type]: calculatedTotalPages
      }));

      setCirculars(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [page]: docs
        }
      }));
    } catch (error) {
      console.error(`Error fetching ${type} circulars:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch circular analysis by ID
  const getCircularById = async (type, id) => {
    if (circularAnalysis[type]?.[id]) {
      return circularAnalysis[type][id];
    }

    let analysisRef;
    let circularRef;

    try {
      if(type==='rbi'){
        analysisRef = doc(db, `rbi_circular_analysis`, id);
        circularRef = doc(db, `rbi_circulars`, id);
      }
      else if(type==='sebi'){
        analysisRef = doc(db, `sebi_circular_analysis`, id);
        circularRef = doc(db, `sebi_circulars`, id);
      }
      const analysisSnap = await getDoc(analysisRef);
      const circularSnap = await getDoc(circularRef)

      if (!analysisSnap.exists() || !circularSnap.exists()) {
        return null;
      }

      const analysisData = analysisSnap.data();
      const circularData = circularSnap.data();

      let impactedClients = [];
      if (analysisData.impacted_clients?.length > 0) {
        const clientPromises = analysisData.impacted_clients.map(clientId =>
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

      let impactedProducts = [];
      if (analysisData.impacted_products?.length > 0) {
        const productPromises = analysisData.impacted_products.map(product =>
          getDoc(doc(db, 'hyperverge_products', product.id))
        );
        const productSnapshots = await Promise.all(productPromises);
        impactedProducts = productSnapshots
          .filter(snap => snap.exists())
          .map((snap, index) => ({
            id: snap.id,
            ...snap.data(),
            impact_description: analysisData.impacted_products[index].impact_description || ''
          }));
      }

      const enrichedAnalysisData = {
        id: analysisSnap.id,
        ...analysisData,
        impacted_clients: impactedClients,
        impacted_products: impactedProducts,
        ...circularData
      };

      setCircularAnalysis(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [id]: enrichedAnalysisData
        }
      }));

      return enrichedAnalysisData;
    } catch (error) {
      console.error(`Error fetching ${type} circular analysis:`, error);
      return null;
    }
  };

  const value = {
    circulars,
    circularAnalysis,
    loading,
    currentPage,
    setCurrentPage,
    getCircularsByPage,
    getCircularById,
    totalPages,
    products,
    clientCategories
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;