import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Search, LogOut, Loader2, Menu, X } from 'lucide-react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { searchCirculars } = useData();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      setIsSearching(true);
      const results = await searchCirculars(value);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (id) => {
    navigate(`/circular/${id}`);
    setSearchTerm('');
    setSearchResults([]);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Hamburger and Logo */}
            <div className="flex items-center gap-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-[#D6D5E9]">
                    <Menu className="h-5 w-5 text-[#3C4A94]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="text-[#3C4A94]">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div 
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[#D6D5E9] cursor-pointer text-gray-600 hover:text-[#3C4A94]"
                      onClick={() => navigate('/')}
                    >
                      Dashboard
                    </div>
                    {/* Add more menu items here */}
                  </div>
                </SheetContent>
              </Sheet>

              <h1 
                onClick={() => navigate('/')} 
                className="text-xl font-bold text-[#3C4A94] cursor-pointer hover:text-[#2d3970] transition-colors"
              >
                Circulars
              </h1>
            </div>

            {/* Right side - Search and Profile */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search circulars..."
                    className="pl-10 w-[250px] focus-visible:ring-[#3C4A94]"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-[#3C4A94]" />
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50 py-1">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleResultClick(result.id)}
                        className="px-4 py-2 hover:bg-[#D6D5E9] cursor-pointer text-sm text-gray-700 hover:text-[#3C4A94]"
                      >
                        {result.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu */}
              {user && (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-[#D6D5E9] text-[#3C4A94]">
                          <AvatarFallback>
                            {getInitials(user.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600 hidden sm:inline-block">
                          {user.displayName}
                        </span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="text-sm text-gray-500">
                        {user.email}
                      </DropdownMenuItem>
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
    </>
  );
};

export default Navbar;