import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const OverviewTab = ({ circular }) => {
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
        {/* Categories Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">Category of the circular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {circular.categories?.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{category}</span>
                  <span className="bg-[#D6D5E9] text-[#3C4A94] px-3 py-1 rounded-full font-medium">
                    {circular.confidence_scores[category]}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Past Circular References Section */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">Past circular references</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {circular.past_circular_references?.length > 0 ? (
                circular.past_circular_references.map((ref, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-[#3C4A94] transition-colors">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3 text-[#3C4A94] font-medium">Reference</div>
                      <div className="col-span-9 text-gray-600">{ref.reference || 'Not provided'}</div>

                      <div className="col-span-3 text-[#3C4A94] font-medium">Date</div>
                      <div className="col-span-9 text-gray-600">{ref.date}</div>

                      <div className="col-span-3 text-[#3C4A94] font-medium">Relationship</div>
                      <div className="col-span-9 text-gray-600">{ref.relationship}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No past circular references found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default OverviewTab;