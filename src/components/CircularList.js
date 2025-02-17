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
        onClick={() => navigate(`/rbi/circular/${circular.id}`)}
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

  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1
  }) => {
    // Generate page range
    const range = (start, end) => {
      let length = end - start + 1;
      return Array.from({ length }, (_, idx) => idx + start);
    };
  
    // Generate pagination items
    const generatePaginationItems = () => {
      // Total numbers to be shown
      const totalNumbers = siblingCount + boundaryCount + 2;
  
      // Case 1: If total pages is less than total numbers we want to show
      if (totalPages <= totalNumbers) {
        return range(1, totalPages);
      }
  
      // Calculate left and right sibling index
      const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount);
      const rightSiblingIndex = Math.min(
        currentPage + siblingCount,
        totalPages - boundaryCount
      );
  
      // Should show dots
      const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - (boundaryCount + 1);
  
      // Case 2: No left dots to show, but rights dots to be shown
      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = boundaryCount + 2 * siblingCount + 2;
        const leftRange = range(1, leftItemCount);
        return [...leftRange, "...", totalPages];
      }
  
      // Case 3: No right dots to show, but left dots to be shown
      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = boundaryCount + 2 * siblingCount + 2;
        const rightRange = range(totalPages - rightItemCount + 1, totalPages);
        return [1, "...", ...rightRange];
      }
  
      // Case 4: Both left and right dots to be shown
      if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = range(leftSiblingIndex, rightSiblingIndex);
        return [1, "...", ...middleRange, "...", totalPages];
      }
    };
  
    const paginationItems = generatePaginationItems();
  
    const renderPaginationButton = (item, index) => {
      if (item === "...") {
        return (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        );
      }
  
      return (
        <Button
          key={item}
          variant={currentPage === item ? "default" : "ghost"}
          className={`h-8 w-8 p-0 ${
            currentPage === item 
              ? "bg-[#3C4A94] text-white hover:bg-[#2d3970]" 
              : "text-[#3C4A94] hover:bg-[#D6D5E9] hover:text-[#2d3970]"
          }`}
          onClick={() => onPageChange(item)}
        >
          {item}
        </Button>
      );
    };
  
    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          className="h-8 px-3 border border-[#3C4A94] text-[#3C4A94]"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
  
        <div className="flex items-center">
          {paginationItems.map((item, index) => renderPaginationButton(item, index))}
        </div>
  
        <Button
          variant="outline"
          className="h-8 px-3 border border-[#3C4A94] text-[#3C4A94]"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

const CircularList = () => {
    const { page = 1 } = useParams();
    const currentPage = parseInt(page);
    const navigate = useNavigate();
    const { circulars, loading, totalPages, setCurrentPage } = useData();
  
    useEffect(() => {
      setCurrentPage(currentPage);
    }, [currentPage, setCurrentPage]);
  
    const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      navigate(`/rbi/page/${newPage}`);
    };
  
    if (loading && !circulars[currentPage]) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-[#3C4A94] rounded-full border-t-transparent"></div>
        </div>
      );
    }
  
    const currentCirculars = circulars[currentPage] || [];
  
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
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-[#3C4A94]">No circulars found</h3>
              <p className="mt-2 text-gray-500">
                There are no circulars available for this page.
              </p>
            </div>
          )}
  
          {/* Pagination */}
          {totalPages > 0 && (
            <div className="mt-8">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
                boundaryCount={1}
              />
            </div>
          )}
        </div>
      </div>
    );
};

export default CircularList;