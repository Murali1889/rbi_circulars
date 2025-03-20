import React, { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronRight, Clock, ChevronLeft, ChevronRight as ChevronRightIcon, Download, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

// Define color schemes based on type
const getTypeColors = (type) => {
  switch (type.toLowerCase()) {
    case 'sebi':
      return {
        primary: '#1E3A8A', // Deep Blue
        hover: '#172554',
        light: '#DBEAFE',
        text: '#1E3A8A',
      };
    case 'irdai':
      return {
        primary: '#047857', // Emerald Green
        hover: '#065F46',
        light: '#D1FAE5',
        text: '#047857',
      };
    default:
      return {
        primary: '#3C4A94', // Default
        hover: '#2D3970',
        light: '#D6D5E9',
        text: '#3C4A94',
      };
  }
};

const CircularCard = ({ circular, type }) => {
  const navigate = useNavigate();
  const colors = getTypeColors(type);

  const handleAction = (e, action) => {
    e.stopPropagation();
    switch (action) {
      case 'visit':
        if (circular.url || circular.documentUrl) window.open(circular.url || circular.documentUrl, '_blank');
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
      onClick={() => navigate(`/${type}/circular/${circular.id}`)}
      className="bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer border-0 shadow-sm group"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2" style={{ color: colors.primary }}>
          {circular.title}
        </CardTitle>
        <div className="flex items-center text-gray-500 text-sm gap-1">
          <Clock className="h-4 w-4" />
          {circular.date}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {(circular.url || circular.documentUrl) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-1 transition-colors duration-200"
                      style={{ color: colors.primary }}
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
                      className="h-8 w-8 p-1 transition-colors duration-200"
                      style={{ color: colors.primary }}
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
            <span
              className="text-sm flex items-center gap-1 transition-colors duration-200"
              style={{ color: colors.primary }}
            >
              View Details
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          {circular.priority && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              Priority
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CircularSkeleton = () => (
  <Card className="bg-white border-0 shadow-sm">
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/4 mt-2" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  type,
  loading,
}) => {
  const colors = getTypeColors(type);

  const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const generatePaginationItems = () => {
    const totalNumbers = siblingCount + boundaryCount + 2;
    if (totalPages <= totalNumbers) return range(1, totalPages);

    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - (boundaryCount + 1);

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = boundaryCount + 2 * siblingCount + 2;
      return [...range(1, leftItemCount), "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = boundaryCount + 2 * siblingCount + 2;
      return [1, "...", ...range(totalPages - rightItemCount + 1, totalPages)];
    }

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
        className="h-8 w-8 p-0 transition-colors duration-200"
        style={{
          backgroundColor: currentPage === item ? colors.primary : 'transparent',
          color: currentPage === item ? 'white' : colors.primary,
        }}
        onMouseEnter={(e) => {
          if (currentPage !== item) {
            e.currentTarget.style.backgroundColor = colors.light;
            e.currentTarget.style.color = colors.hover;
          } else {
            e.currentTarget.style.backgroundColor = colors.hover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = currentPage === item ? colors.primary : 'transparent';
          e.currentTarget.style.color = currentPage === item ? 'white' : colors.primary;
        }}
        onClick={() => onPageChange(item)}
        disabled={loading}
      >
        {item}
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        className="h-8 px-3 transition-colors duration-200"
        style={{
          borderColor: colors.primary,
          color: colors.primary,
          opacity: loading || currentPage === 1 ? 0.5 : 1,
        }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={loading || currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {paginationItems.map((item, index) => renderPaginationButton(item, index))}
      </div>

      <Button
        variant="outline"
        className="h-8 px-3 transition-colors duration-200"
        style={{
          borderColor: colors.primary,
          color: colors.primary,
          opacity: loading || currentPage === totalPages ? 0.5 : 1,
        }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={loading || currentPage === totalPages}
      >
        Next
        <ChevronRightIcon className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

const CircularList = ({ type }) => {
  const { page = 1 } = useParams();
  const currentPage = parseInt(page) || 1;
  const navigate = useNavigate();
  const {
    getCircularsByPage,
    loading,
    totalPages,
    setCurrentPage,
    circulars,
    currentPage: contextCurrentPage,
  } = useData();
  const colors = getTypeColors(type);
  const ITEMS_PER_PAGE = 6;

  const fetchCirculars = useCallback(() => {
    if (!circulars[type]?.[currentPage]) {
      getCircularsByPage(type, currentPage);
    }
  }, [type, currentPage, getCircularsByPage, circulars]);

  useEffect(() => {
    if (currentPage !== contextCurrentPage[type]) {
      setCurrentPage(type, currentPage);
    }
    fetchCirculars();
  }, [currentPage, type, contextCurrentPage, setCurrentPage, fetchCirculars]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages[type]) return;
    navigate(`/${type}/page/${newPage}`);
  };

  const currentCirculars = circulars[type]?.[currentPage] || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: `${colors.light}40` }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>
            {type.toUpperCase()} Circulars
          </h1>
          <p className="text-gray-600 mt-2">
            Browse and search through all {type.toUpperCase()} circulars
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <CircularSkeleton key={index} />
              ))
            : currentCirculars.map((circular) => (
                <CircularCard key={circular.id} circular={circular} type={type} />
              ))}
        </div>

        {currentCirculars.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium" style={{ color: colors.primary }}>
              No circulars found
            </h3>
            <p className="mt-2 text-gray-500">
              There are no circulars available for this page.
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages[type] || 1}
          onPageChange={handlePageChange}
          siblingCount={1}
          boundaryCount={1}
          type={type}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CircularList;