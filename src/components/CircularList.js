import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronRight, Clock } from 'lucide-react';

const CircularCard = ({ circular }) => {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(`/circular/${circular.id}`)}
      className="bg-white hover:shadow-lg transition-all cursor-pointer border-0 shadow-sm group"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#3C4A94] line-clamp-2 group-hover:text-[#2d3970]">
          {circular.title}
        </CardTitle>
        <div className="flex items-center text-gray-500 text-sm gap-1">
          <Clock className="h-4 w-4" />
          {new Date(circular.date).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {circular.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#3C4A94] group-hover:text-[#2d3970] flex items-center gap-1">
            View Details 
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          {circular.priority && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              Priority
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CircularList = () => {
  const { page = 1 } = useParams();
  const currentPage = parseInt(page);
  const navigate = useNavigate();
  const { circulars, loading, fetchCirculars, setCurrentPage } = useData();

  useEffect(() => {
    setCurrentPage(currentPage);
    fetchCirculars(currentPage);
  }, [currentPage, fetchCirculars, setCurrentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    navigate(`/page/${newPage}`);
  };

  if (loading && !circulars[currentPage]) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-[#3C4A94] rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const currentCirculars = circulars[currentPage] || [];
  const hasNextPage = currentCirculars.length === 6;

  return (
    <div className="min-h-screen bg-[#D6D5E9] bg-opacity-30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3C4A94]">Circulars</h1>
          <p className="text-gray-600 mt-2">Browse and search through all circulars</p>
        </div>

        {/* Grid of Circulars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCirculars.map((circular) => (
            <CircularCard key={circular.id} circular={circular} />
          ))}
        </div>

        {/* Empty State */}
        {currentCirculars.length === 0 && !loading && (
          <Card className="py-12 text-center">
            <CardContent>
              <h3 className="text-lg font-medium text-[#3C4A94]">No circulars found</h3>
              <p className="mt-2 text-gray-500">
                There are no circulars available for this page.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {circulars?.length > 5 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#3C4A94] hover:bg-[#D6D5E9] hover:text-[#2d3970] border shadow-sm'
                }`}
            >
              Previous
            </button>

            {/* Current Page Indicator */}
            <span className="px-4 py-2 rounded-md bg-[#D6D5E9] text-[#3C4A94] font-medium">
              Page {currentPage}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${!hasNextPage
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#3C4A94] hover:bg-[#D6D5E9] hover:text-[#2d3970] border shadow-sm'
                }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loading && circulars[currentPage] && (
          <div className="mt-6 text-center text-[#3C4A94]">
            Loading more circulars...
          </div>
        )}
      </div>
    </div>
  );
};

export default CircularList;