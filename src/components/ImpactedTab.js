import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";

const CLIENTS_PER_PAGE = 20;

const ImpactedTab = ({ circular }) => {
  // State to track current page for each category
  const [categoryPages, setCategoryPages] = useState({});

  const clientsByCategory = useMemo(() => {
    if (!circular.impacted_clients || circular.impacted_clients.length === 0) {
      return {};
    }

    return circular.impacted_clients.reduce((acc, client) => {
      const category = client.client_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(client);
      return acc;
    }, {});
  }, [circular.impacted_clients]);

  const renderPagination = (category, totalClients) => {
    const currentPage = categoryPages[category] || 1;
    const totalPages = Math.ceil(totalClients / CLIENTS_PER_PAGE);

    return (
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryPages(prev => ({
            ...prev,
            [category]: currentPage - 1
          }))}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryPages(prev => ({
            ...prev,
            [category]: currentPage + 1
          }))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const renderClientsByCategory = () => {
    if (!circular.impacted_clients || circular.impacted_clients.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No clients are impacted by this circular.</p>
          <p className="text-sm text-gray-500 mt-2">This circular may be informational or may not have direct client impact.</p>
        </div>
      );
    }

    return (
      <Tabs defaultValue={Object.keys(clientsByCategory)[0]} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-white overflow-x-auto">
          {Object.keys(clientsByCategory).map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#3C4A94] data-[state=active]:text-[#3C4A94] rounded-none px-6 py-3 whitespace-nowrap"
            >
              {category} ({clientsByCategory[category].length})
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(clientsByCategory).map(([category, clients]) => {
          const currentPage = categoryPages[category] || 1;
          const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
          const paginatedClients = clients.slice(startIndex, startIndex + CLIENTS_PER_PAGE);
          
          // Get impact reason for this category if available
          const categoryInfo = circular?.categories?.[category];

          return (
            <TabsContent key={category} value={category} className="mt-4">
              {/* Display category impact reason and confidence if available */}
              {categoryInfo && (
                <Alert className="mb-4 bg-[#EEF0FB] border-[#3C4A94] text-[#3C4A94]">
                  <AlertDescription>
                    {/* <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Confidence: {categoryInfo.confidence}%</span>
                    </div> */}
                    <p>{categoryInfo.reason}</p>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
                {paginatedClients.map((client, index) => (
                  <div 
                    key={`${category}-${index}`} 
                    className="p-4 rounded-lg border border-gray-200 hover:border-[#3C4A94] transition-colors bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[#3C4A94]">{client.client_name}</h4>
                      </div>
                      {client.client_url && (
                        <a
                          href={client.client_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3C4A94] hover:text-[#2d3970]"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {client.impact_reason && (
                      <p className="text-gray-600 text-sm mt-2 italic">
                        {client.impact_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {clients.length > CLIENTS_PER_PAGE && renderPagination(category, clients.length)}
            </TabsContent>
          );
        })}
      </Tabs>
    );
  };

  const renderProducts = () => {
    if (!circular.impacted_products || circular.impacted_products.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No Hyperverge products are mentioned in this circular.</p>
          <p className="text-sm text-gray-500 mt-2">This circular may not have direct product implications.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {circular.impacted_products.map((product, index) => (
          <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-[#3C4A94] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-[#3C4A94]">{product.title}</h4>
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3C4A94] hover:text-[#2d3970]"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-gray-700 text-sm mt-2">{product.impact_reason || product.impact_description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Impacted Clients */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#3C4A94] text-xl">List of clients potentially impacted</CardTitle>
        </CardHeader>
        <CardContent>
          {renderClientsByCategory()}
        </CardContent>
      </Card>

      {/* Impacted Products */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#3C4A94] text-xl">List of HV's products mentioned/impacted</CardTitle>
        </CardHeader>
        <CardContent>
          {renderProducts()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactedTab;