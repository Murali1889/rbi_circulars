import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, limit, startAfter, where } from 'firebase/firestore';


const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [circulars, setCirculars] = useState({ rbi: {}, sebi: {}, irdai:{}, meity:{} });
  const [circularAnalysis, setCircularAnalysis] = useState({ rbi: {}, sebi: {}, irdai:{}, meity:{} });
  const [products, setProducts] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPageState] = useState({ rbi: 1, sebi: 1, irdai:1, meity:1 });
  const [totalPages, setTotalPages] = useState({ rbi: 0, sebi: 0, irdai:0, meity:0 });
  const [lastDocs, setLastDocs] = useState({ rbi: null, sebi: null, irdai:0, meity:0 });
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
        // console.error('Error fetching metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  // Set current page for specific type
  const setCurrentPage = (type, page) => {
    setCurrentPageState(prev => ({ ...prev, [type]: page }));
  };


  const parseDateString = (dateStr) => {
    // Remove any extra whitespace
    dateStr = dateStr.trim();
  
    // Check for "DD-MM-YYYY" format (e.g., "29-12-2021")
    const ddmmyyyyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      // JavaScript months are 0-based, so subtract 1 from month when constructing Date
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format for "${dateStr}"`);
        return null; // Return null for invalid dates
      }
      return date;
    }
  
    // Check for "MMM DD, YYYY" format (e.g., "Dec 11, 2015")
    const mmmddyyyyMatch = dateStr.match(/^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/);
    if (mmmddyyyyMatch) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format for "${dateStr}"`);
        return null;
      }
      return date;
    }
  
    // If format doesn't match, log a warning and return null
    console.warn(`Unrecognized date format for "${dateStr}"`);
    return null;
  };
  
  const getCircularsByPage = async (type, page, fromDate) => {
    // console.log(`Fetching ${type} circulars, page ${page}, fromDate: ${fromDate}`);
    setLoading(true);
    try {
      const collectionName = `${type}_circulars`;
  
      // Parse fromDate into a Date object if provided
      const fromDateObj = fromDate ? new Date(fromDate) : null;
      const fromDateStr = fromDateObj
        ? fromDateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })
        : null;
      console.log(`Parsed fromDate: ${fromDateStr}`);
  
      // Fetch all documents (no orderBy since string sorting is unreliable)
      let q = query(collection(db, collectionName));
      if (fromDateStr) {
        q = query(
          collection(db, collectionName),
          where('date', '>=', fromDateStr)
        );
      }
  
      const snapshot = await getDocs(q);
      console.log(`Total fetched: ${snapshot.size}`);
  
      // Convert to array and add Date object for sorting
      let docs = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const dateObj = parseDateString(data.date);
          // if (!dateObj) {
          //   console.warn(`Skipping document ${doc.id} due to invalid date: ${data.date}`);
          //   return null; // Skip documents with invalid dates
          // }
          return {
            id: doc.id,
            ...data,
            dateObj , // Add parsed Date object for sorting
          };
        })
        .filter(doc => doc !== null); // Remove null entries (invalid dates)
  
      // Sort by date descending (latest first)
      docs.sort((a, b) => b.dateObj - a.dateObj);
      // console.log('Sorted docs:', docs);
  
      // Paginate
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginatedDocs = docs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
      // Clean up for state (keep original string date)
      const finalDocs = paginatedDocs.map(doc => ({
        id: doc.id,
        date: doc.date,
        ...doc,
      }));
      console.log('Paginated docs:', finalDocs);
  
      // Calculate total pages
      const totalCount = docs.length;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      // console.log(`Total count: ${totalCount}, Total pages: ${totalPages}`);
  
      // Update state
      setTotalPages(prev => ({
        ...prev,
        [type]: totalPages,
      }));
  
      setCirculars(prev => {
        const updated = {
          ...prev,
          [type]: {
            ...prev[type],
            [page]: finalDocs,
          },
        };
        // console.log('Updated circulars:', updated);
        return updated;
      });
  
      return { docs: finalDocs, totalPages };
    } catch (error) {
      // console.error(`Error fetching ${type} circulars:`, error);
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
      else if(type==='irdai'){
        analysisRef = doc(db, `irdai_circular_analysis`, id);
        circularRef = doc(db, `irdai_circulars`, id);
      }
      else if(type==='meity'){
        analysisRef = doc(db, `meity_circular_analysis`, id);
        circularRef = doc(db, `meity_circulars`, id);
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

      // let impactedProducts = [];
      // if (analysisData.impacted_products?.length > 0) {
      //   const productPromises = analysisData.impacted_products.map(product =>
      //     getDoc(doc(db, 'hyperverge_products', product.id))
      //   );
      //   const productSnapshots = await Promise.all(productPromises);
      //   impactedProducts = productSnapshots
      //     .filter(snap => snap.exists())
      //     .map((snap, index) => ({
      //       id: snap.id,
      //       ...snap.data(),
      //       impact_description: analysisData.impacted_products[index].impact_description || ''
      //     }));
      // }

      const enrichedAnalysisData = {
        id: analysisSnap.id,
        ...analysisData,
        impacted_clients: impactedClients,
        // impacted_products: impactedProducts,
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
      // console.error(`Error fetching ${type} circular analysis:`, error);
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