import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronRight, Clock, ChevronLeft, ChevronRight as ChevronRightIcon,Download, ExternalLink } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "./ui/tooltip";
import { Button } from "./ui/button";

const CircularCard = ({ circular }) => {
    const navigate = useNavigate();
  
    const handleAction = (e, action) => {
      e.stopPropagation(); // Prevent card click when clicking buttons
      switch(action) {
        case 'visit':
          if (circular.documentUrl) window.open(circular.documentUrl, '_blank');
          break;
        case 'download':
          if (circular.pdfUrl) window.open(circular.pdfUrl, '_blank');
          break;
        default:
          break;
      }
    };
  
    return (
      <Card 
        onClick={() => navigate(`/circular/${circular.id}`)}
        className="bg-white hover:shadow-lg transition-all cursor-pointer border-0 shadow-sm group relative"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#3C4A94] line-clamp-2 group-hover:text-[#2d3970]">
            {circular.title}
          </CardTitle>
          <div className="flex items-center text-gray-500 text-sm gap-1">
            <Clock className="h-4 w-4" />
            {circular.date}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {circular.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Action Buttons */}
              <TooltipProvider>
                {circular.documentUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-1 text-[#3C4A94] hover:text-[#2d3970] hover:bg-[#D6D5E9]"
                        onClick={(e) => handleAction(e, 'visit')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visit Website</p>
                    </TooltipContent>
                  </Tooltip>
                )}
  
                {circular.pdfUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-1 text-[#3C4A94] hover:text-[#2d3970] hover:bg-[#D6D5E9]"
                        onClick={(e) => handleAction(e, 'download')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download PDF</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
  
              <span className="text-sm text-[#3C4A94] group-hover:text-[#2d3970] flex items-center gap-1">
                View Details 
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
  
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

const Pagination = ({ currentPage, hasNextPage, onPageChange, totalPages = 10 }) => {
  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (showEllipsisStart) {
      pages.push(
        <Button
          key={1}
          variant="ghost"
          className="h-8 w-8 p-0 text-[#3C4A94]"
          onClick={() => onPageChange(1)}
        >
          1
        </Button>,
        <span key="ellipsis-start" className="px-2 text-gray-400">...</span>
      );
    }

    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "ghost"}
          className={`h-8 w-8 p-0 ${
            currentPage === i 
              ? "bg-[#3C4A94] text-white hover:bg-[#2d3970]" 
              : "text-[#3C4A94] hover:bg-[#D6D5E9] hover:text-[#2d3970]"
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }

    if (showEllipsisEnd) {
      pages.push(
        <span key="ellipsis-end" className="px-2 text-gray-400">...</span>,
        <Button
          key={totalPages}
          variant="ghost"
          className="h-8 w-8 p-0 text-[#3C4A94]"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        className="h-8 px-3 border border-[#3C4A94] text-[#3C4A94]"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <div className="flex items-center">
        {renderPageNumbers()}
      </div>

      <Button
        variant="outline"
        className="h-8 px-3 border border-[#3C4A94] text-[#3C4A94]"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Next
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

const CircularList = () => {
  const { page = 1 } = useParams();
  const currentPage = parseInt(page);
  const navigate = useNavigate();
  const { circulars, loading, setCurrentPage } = useData();

  useEffect(() => {
    setCurrentPage(currentPage);
    // fetchCirculars(currentPage);
  }, [currentPage, setCurrentPage]);

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
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            onPageChange={handlePageChange}
            totalPages={10}
          />
        </div>

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