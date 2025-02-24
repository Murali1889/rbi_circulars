import React from 'react';
import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Badge } from "./ui/badge";

const SearchFilters = ({ 
  products,
  clientCategories,
  currentFilters,
  onApplyFilters,
  onClearFilters,
  loading
}) => {
  const [localFilters, setLocalFilters] = React.useState(currentFilters);
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2015 }, 
    (_, i) => currentYear - i
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onApplyFilters(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      product: null,
      clientCategory: null,
      fromYear: null,
      toYear: null
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  // Count active filters
  const activeFilterCount = Object.values(currentFilters)
    .filter(value => value !== null).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="ml-2"
          disabled={loading}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Circulars</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Products Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Product</label>
            <Select 
              value={localFilters.product || ""}
              onValueChange={(value) => handleFilterChange('product', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Products</SelectItem>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Category</label>
            <Select 
              value={localFilters.clientCategory || ""}
              onValueChange={(value) => handleFilterChange('clientCategory', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {clientCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <Select 
                value={localFilters.fromYear || ""}
                onValueChange={(value) => handleFilterChange('fromYear', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="From Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={localFilters.toYear || ""}
                onValueChange={(value) => handleFilterChange('toYear', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="To Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="w-full"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SearchFilters;