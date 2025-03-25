import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Loader2,
  FileText,
  Box,
  Users,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  LogOut
} from 'lucide-react';
import { Input } from "./ui/input";
import { useAuth } from '../context/AuthContext';
import { Button } from "./ui/button";
import { useNavigate, useLocation} from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useData } from '../context/DataContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

// Memoized SortButton
const SortButton = React.memo(({ onClick, sortOrder }) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className="h-8 w-8 p-0 hover:bg-gray-100"
  >
    <ArrowUpDown
      className={`h-4 w-4 transition-transform duration-200 ${sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-500'}`}
      style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
    />
  </Button>
));

// Memoized NoResults
const NoResults = React.memo(({ title }) => (
  <div className="px-4 py-6 text-center">
    <div className="text-sm font-medium text-gray-500">No {title} found</div>
    <div className="text-xs text-gray-400 mt-1">Try a different search term</div>
  </div>
));

// Memoized RelatedCircularsSection
const RelatedCircularsSection = React.memo(({ relatedCirculars, onResultClick, type }) => {
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedCirculars = useMemo(() => {
    if (!relatedCirculars?.length) return [];
    return [...relatedCirculars].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [relatedCirculars, sortOrder]);

  if (!relatedCirculars?.length) {
    return (
      <div className="px-4 py-3 text-sm text-gray-500 text-center bg-gray-50">
        No related circulars found
      </div>
    );
  }

  return (
    <div className="border-t">
      <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
        <span className="text-sm text-gray-600">Related Circulars</span>
        <SortButton onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} sortOrder={sortOrder} />
      </div>
      {sortedCirculars.map((circular) => (
        <div
          key={circular.id}
          onClick={() => onResultClick('circular', circular.id, type)}
          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
        >
          <div className="text-sm font-medium text-gray-700 hover:text-blue-600 line-clamp-1">
            {circular.title || 'Untitled Circular'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {circular.date ? new Date(circular.date).toLocaleDateString() : 'No date'}
          </div>
        </div>
      ))}
    </div>
  );
});

// Memoized SearchResults
const SearchResults = React.memo(({ results, onResultClick, type }) => {
  const { circulars } = useData();
  const [expandedItems, setExpandedItems] = useState({ products: {}, clients: {} });
  const [relatedCirculars, setRelatedCirculars] = useState({ products: {}, clients: {} });
  const [isLoading, setIsLoading] = useState({ products: {}, clients: {} });

  const fetchRelatedCirculars = useCallback(async (categoryType, item) => {
    if (isLoading[categoryType][item.id]) return;

    setIsLoading(prev => ({
      ...prev,
      [categoryType]: { ...prev[categoryType], [item.id]: true }
    }));

    try {
      const db = getFirestore();
      const analysisCollection = `${type}_circular_analysis`;
      let analysisRef;

      if (categoryType === 'products') {
        analysisRef = collection(db, analysisCollection);
        const snapshot = await getDocs(analysisRef);

        const matchingDocs = snapshot.docs.filter(doc => {
          const data = doc.data();
          return data.impacted_products?.some(product => product.id === item.id);
        });

        const circularIds = matchingDocs.map(doc => doc.id);
        const allCirculars = Object.values(circulars).flat();
        const related = circularIds.map(id => allCirculars.find(c => c.id === id)).filter(Boolean);

        setRelatedCirculars(prev => ({
          ...prev,
          [categoryType]: { ...prev[categoryType], [item.id]: related }
        }));
      } else {
        analysisRef = query(
          collection(db, analysisCollection),
          where('impacted_clients', 'array-contains', item.id)
        );
        const analysisSnapshot = await getDocs(analysisRef);
        const circularIds = analysisSnapshot.docs.map(doc => doc.id);
        const allCirculars = Object.values(circulars).flat();
        const related = circularIds.map(id => allCirculars.find(c => c.id === id)).filter(Boolean);

        setRelatedCirculars(prev => ({
          ...prev,
          [categoryType]: { ...prev[categoryType], [item.id]: related }
        }));
      }
    } catch (error) {
      console.error(`Error fetching related ${type} circulars:`, error);
    } finally {
      setIsLoading(prev => ({
        ...prev,
        [categoryType]: { ...prev[categoryType], [item.id]: false }
      }));
    }
  }, [circulars, isLoading, type]);

  const toggleExpand = useCallback(async (categoryType, item) => {
    const newExpandedItems = { ...expandedItems };
    const isCurrentlyExpanded = !newExpandedItems[categoryType][item.id];

    Object.keys(newExpandedItems[categoryType]).forEach(key => {
      newExpandedItems[categoryType][key] = false;
    });

    newExpandedItems[categoryType][item.id] = isCurrentlyExpanded;
    setExpandedItems(newExpandedItems);

    if (isCurrentlyExpanded) {
      await fetchRelatedCirculars(categoryType, item);
    }
  }, [expandedItems, fetchRelatedCirculars]);

  const renderSection = useCallback((title, Icon, items) => {
    if (!items) return null;

    return (
      <div className="flex-1 min-w-[320px] border-r last:border-r-0 bg-white">
        <div className="px-4 py-3 bg-gray-50 border-b sticky top-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {!items.length ? (
            <NoResults title={title.toLowerCase()} />
          ) : (
            items.map((item) => {
              const categoryType = title === 'Clients' ? 'clients' : 'products';
              const isExpanded = expandedItems[categoryType]?.[item.id] || false;
              const isItemLoading = isLoading[categoryType]?.[item.id] || false;

              return (
                <div key={item.id} className="border-b last:border-b-0">
                  <div
                    onClick={() => {
                      if (title === 'Circulars') {
                        onResultClick('circular', item.id, type);
                      } else {
                        toggleExpand(categoryType, item);
                      }
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {title !== 'Circulars' && (
                            <div className="flex-shrink-0">
                              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate">
                            {title === 'Circulars' ? item.title : title === 'Clients' ? item.client_name : item.title}
                          </div>
                        </div>
                        {title === 'Products' && item.impact_description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2 pl-6">
                            Impact: {item.impact_description}
                          </div>
                        )}
                        {title === 'Clients' && item.client_category && (
                          <div className="text-xs text-gray-500 mt-1 pl-6">
                            Category: {item.client_category}
                          </div>
                        )}
                        {title === 'Circulars' && item.date && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {isItemLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-2" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <RelatedCircularsSection
                      relatedCirculars={relatedCirculars[categoryType]?.[item.id] || []}
                      onResultClick={onResultClick}
                      type={type}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }, [expandedItems, isLoading, onResultClick, relatedCirculars, toggleExpand, type]);

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50 flex">
      {renderSection('Circulars', FileText, results.circulars)}
      {renderSection('Products', Box, results.products)}
      {renderSection('Clients', Users, results.clients)}
    </div>
  );
});

// Navbar Component
const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const type = location.pathname.split('/')[1] || 'rbi';
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const [searchResults, setSearchResults] = useState({ circulars: [], products: [], clients: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults({ circulars: [], products: [], clients: [] });
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleSearch = useCallback(async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length < 2) {
      setSearchResults({ circulars: [], products: [], clients: [] });
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const db = getFirestore();
        const circularsCollection = `${type}_circulars`;
        const productsCollection = 'hyperverge_products';
        const clientsCollection = 'hyperverge_clients';

        const [circularsSnap, productsSnap, clientsSnap] = await Promise.all([
          getDocs(collection(db, circularsCollection)),
          getDocs(collection(db, productsCollection)),
          getDocs(collection(db, clientsCollection))
        ]);

        const searchValue = value.toLowerCase();

        const circulars = circularsSnap.docs
          .filter(doc => doc.data().title?.toLowerCase().includes(searchValue))
          .map(doc => ({ id: doc.id, ...doc.data() }));

        const products = productsSnap.docs
          .filter(doc => doc.data().title?.toLowerCase().includes(searchValue))
          .map(doc => ({ id: doc.id, ...doc.data() }));

        const clients = clientsSnap.docs
          .filter(doc => doc.data().client_name?.toLowerCase().includes(searchValue))
          .map(doc => ({ id: doc.id, ...doc.data() }));

        setSearchResults({ circulars, products, clients });
      } catch (error) {
        console.error(`Search error for ${type}:`, error);
        setSearchResults({ circulars: [], products: [], clients: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce time
  }, [type]);

  const handleResultClick = useCallback((resultType, id, circularType) => {
    if (resultType === 'circular') {
      navigate(`/${circularType}/circular/${id}`);
      setSearchTerm('');
      setSearchResults({ circulars: [], products: [], clients: [] });
    }
  }, [navigate]);

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="relative w-[320px]" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder={`Search ${type.toUpperCase()} circulars, products, or clients...`}
                  className="pl-10 w-full focus-visible:ring-blue-600"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
              {(searchTerm.length >= 2 || searchResults.circulars.length > 0 || searchResults.products.length > 0 || searchResults.clients.length > 0) && (
                <SearchResults results={searchResults} onResultClick={handleResultClick} type={type} />
              )}
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-[#D6D5E9] text-[#3C4A94]">
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 hidden sm:inline-block">{user.displayName}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-sm text-gray-500">{user.email}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;