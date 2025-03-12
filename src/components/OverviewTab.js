import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const OverviewTab = ({ circular }) => {
  // Extract category names from the categories object
  const categoryNames = circular.categories ? Object.keys(circular.categories) : [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6 md:col-span-1">
        {/* Summary Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">Summary of the circular</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{circular.summary}</p>
          </CardContent>
        </Card>

        {/* Important Dates Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">Important dates/timelines mentioned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {circular.important_dates?.length > 0 ? (
                circular.important_dates.map((date, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12">
                      <span className="font-medium text-[#3C4A94]">{date.description}</span>
                    </div>
                    <div className="col-span-12">
                      <span className="text-gray-600">{date.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No important dates mentioned in this circular</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 md:col-span-1">
        {/* Categories Section - Updated to show only names */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">Category of the circular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categoryNames.length > 0 ? (
                categoryNames.map((category) => (
                  <Badge 
                    key={category} 
                    className="bg-[#EEF0FB] text-[#3C4A94] hover:bg-[#D6D5E9] px-3 py-1 text-sm font-medium rounded-full"
                  >
                    {category}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-600">No categories assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Circular References Section - Updated structure */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">Past circular references</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {circular.past_circular_reference?.length > 0 ? (
                circular.past_circular_reference.map((ref, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-[#3C4A94] transition-colors">
                    <h4 className="text-[#3C4A94] font-medium mb-1">{ref.reference}</h4>
                    <p className="text-gray-500 text-sm mb-2">{ref.date}</p>
                    {ref.url && (
                      <a 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm block mb-2"
                      >
                        View Circular
                      </a>
                    )}
                    <p className="text-gray-700 text-sm">
                      {ref.deltaAnalysis || ref.description || 'No details available'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No past circular references found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;