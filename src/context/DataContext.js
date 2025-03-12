import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, limit, where } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [circulars, setCirculars] = useState({});
  const [circularAnalysis, setCircularAnalysis] = useState({});
  const [products, setProducts] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    product: null,
    clientCategory: null,
    fromYear: null,
    toYear: null
  });
  const ITEMS_PER_PAGE = 6;

  // Fetch initial metadata (products and client categories)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const db = getFirestore();

        // Fetch products
        const productsSnap = await getDocs(collection(db, 'hyperverge_products'));
        const productsData = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);

        // Fetch unique client categories
        const clientsSnap = await getDocs(collection(db, 'hyperverge_clients'));
        const categories = new Set();
        clientsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.client_category) {
            categories.add(data.client_category);
          }
        });
        setClientCategories(Array.from(categories));
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch circulars with filters
  const fetchCirculars = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const db = getFirestore();
      const circularsRef = collection(db, 'rbi_circulars');
      const analysisRef = collection(db, 'rbi_circular_analysis');

      // Get all circular analysis documents first
      const analysisSnap = await getDocs(analysisRef);
      const matchingCircularIds = new Set();

      // Process each analysis document
      for (const analysisDoc of analysisSnap.docs) {
        const analysisData = analysisDoc.data();
        let matchesFilters = true;

        // Product filter
        if (activeFilters.product) {
          const hasProduct = analysisData.impacted_products?.some(
            p => p.id === activeFilters.product
          );
          if (!hasProduct) {
            matchesFilters = false;
            continue;
          }
        }

        // Client category filter
        if (activeFilters.clientCategory && analysisData.impacted_clients) {
          let hasMatchingClient = false;
          for (const clientId of analysisData.impacted_clients) {
            const clientDoc = await getDoc(doc(db, 'hyperverge_clients', clientId));
            if (clientDoc.exists() &&
              clientDoc.data().client_category === activeFilters.clientCategory) {
              hasMatchingClient = true;
              break;
            }
          }
          if (!hasMatchingClient) {
            matchesFilters = false;
            continue;
          }
        }

        if (matchesFilters) {
          matchingCircularIds.add(analysisDoc.id);
        }
      }

      // Get all circulars
      const circularsSnap = await getDocs(circularsRef);
      let filteredDocs = circularsSnap.docs
        .filter(doc => {
          // If we have product or client category filters, only include circulars in matchingCircularIds
          if ((activeFilters.product || activeFilters.clientCategory) &&
            !matchingCircularIds.has(doc.id)) {
            return false;
          }

          // Apply date filters
          if (activeFilters.fromYear || activeFilters.toYear) {
            const circularYear = new Date(doc.data().date).getFullYear();
            if (activeFilters.fromYear && circularYear < parseInt(activeFilters.fromYear)) {
              return false;
            }
            if (activeFilters.toYear && circularYear > parseInt(activeFilters.toYear)) {
              return false;
            }
          }
          return true;
        })
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      // Sort by date
      const sortedDocs = filteredDocs.sort((a, b) => {
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
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error fetching circulars:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = async (newFilters) => {
    setFilters(newFilters);
    await fetchCirculars(newFilters);
  };

  // Clear filters
  const clearFilters = async () => {
    const emptyFilters = {
      product: null,
      clientCategory: null,
      fromYear: null,
      toYear: null
    };
    setFilters(emptyFilters);
    await fetchCirculars(emptyFilters);
  };

  // Initial fetch
  useEffect(() => {
    fetchCirculars();
  }, []);

  const searchAllContent = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        circulars: [],
        products: [],
        clients: [],
        loading: false
      };
    }

    const db = getFirestore();
    const searchTermLower = searchTerm.toLowerCase();

    try {
      // Parallel search functions
      const searchCirculars = async () => {
        try {
          const circularsRef = collection(db, 'rbi_circulars');
          
          // Fetch all circulars and filter client-side
          const circularsSnap = await getDocs(circularsRef);
          
          // Filter circulars that include the search term (case-insensitive)
          const matchingCirculars = circularsSnap.docs
            .filter(doc => {
              const title = doc.data().title.toLowerCase();
              return title.includes(searchTerm.toLowerCase());
            })
            .slice(0, 5) // Limit to 5 results
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
      
          return matchingCirculars;
        } catch (error) {
          console.error('Circulars search error:', error);
          return [];
        }
      };
      
      const searchProducts = async () => {
        try {
          const productsRef = collection(db, 'hyperverge_products');
          
          // Fetch all products and filter client-side
          const productsSnap = await getDocs(productsRef);
          
          // Filter products that include the search term (case-insensitive)
          const matchingProducts = await Promise.all(
            productsSnap.docs
              .filter(doc => {
                const title = doc.data().title.toLowerCase();
                return title.includes(searchTerm.toLowerCase());
              })
              .slice(0, 5) // Limit to 5 results
              .map(async (productDoc) => {
                const productData = {
                  id: productDoc.id,
                  ...productDoc.data()
                };
      
                // Try to find associated circular analysis
                try {
                  const analysisRef = query(
                    collection(db, 'rbi_circular_analysis'),
                    where('impacted_products', 'array-contains', { id: productData.id })
                  );
                  const analysisSnap = await getDocs(analysisRef);
      
                  const circularId = analysisSnap.docs.length > 0
                    ? analysisSnap.docs[0].id
                    : null;
      
                  return {
                    ...productData,
                    circularId,
                    impact_description: analysisSnap.docs[0]?.data()?.impacted_products
                      ?.find(p => p.id === productData.id)?.impact_description || ''
                  };
                } catch (error) {
                  console.error('Product circular search error:', error);
                  return productData;
                }
              })
          );
      
          return matchingProducts;
        } catch (error) {
          console.error('Products search error:', error);
          return [];
        }
      };
      
      const searchClients = async () => {
        try {
          const clientsRef = collection(db, 'hyperverge_clients');
          
          // Fetch all clients and filter client-side
          const clientsSnap = await getDocs(clientsRef);
          
          // Filter clients that include the search term (case-insensitive)
          const matchingClients = await Promise.all(
            clientsSnap.docs
              .filter(doc => {
                const clientName = doc.data().client_name.toLowerCase();
                return clientName.includes(searchTerm.toLowerCase());
              })
              .slice(0, 5) // Limit to 5 results
              .map(async (clientDoc) => {
                const clientData = {
                  id: clientDoc.id,
                  ...clientDoc.data()
                };
      
                // Try to find associated circular analysis
                try {
                  const analysisRef = query(
                    collection(db, 'rbi_circular_analysis'),
                    where('impacted_clients', 'array-contains', clientData.id)
                  );
                  const analysisSnap = await getDocs(analysisRef);
      
                  const circularId = analysisSnap.docs.length > 0
                    ? analysisSnap.docs[0].id
                    : null;
      
                  return {
                    ...clientData,
                    circularId
                  };
                } catch (error) {
                  console.error('Client circular search error:', error);
                  return clientData;
                }
              })
          );
      
          return matchingClients;
        } catch (error) {
          console.error('Clients search error:', error);
          return [];
        }
      };

      // Perform searches in parallel
      const [circulars, products, clients] = await Promise.all([
        searchCirculars(),
        searchProducts(),
        searchClients()
      ]);

      return {
        circulars,
        products,
        clients,
        loading: false
      };
    } catch (error) {
      console.error('Overall search error:', error);
      return {
        circulars: [],
        products: [],
        clients: [],
        loading: false
      };
    }
  };

  const getCircularById = async (id) => {
    if (circularAnalysis[id]) {
      return circularAnalysis[id];
    }

    try {
      const db = getFirestore();
      const analysisRef = doc(db, 'rbi_circular_analysis', id);
      const analysisSnap = await getDoc(analysisRef);

      if (!analysisSnap.exists()) {
        return null;
      }

      const analysisData = analysisSnap.data();

      // Fetch impacted clients
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

      // Fetch impacted products
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
        impacted_products: impactedProducts
      };

      setCircularAnalysis(prev => ({
        ...prev,
        [id]: enrichedAnalysisData
      }));

      return enrichedAnalysisData;
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
    searchAllContent,
    getCircularById,
    totalPages,
    products,
    clientCategories,
    filters,
    applyFilters,
    clearFilters
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;