import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';

const OverviewTab = ({ circular, colors }) => {
  // Default colors
  const defaultColors = {
    primary: '#3C4A94',
    hover: '#2D3970',
    light: '#D6D5E9',
    text: '#3C4A94',
  };
  const theme = colors || defaultColors;

  // State for summary expansion
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const summaryLines = circular.summary ? circular.summary.split('\n').length : 0;
  const isSummaryLong = summaryLines > 5;

  // State for past references expansion
  const [expandedRefs, setExpandedRefs] = useState({});

  // Extract category names and past references
  const categoryNames = circular.categories ? Object.keys(circular.categories) : [];
  const pastRefs = circular.past_circular_reference || [];

  // Toggle function for individual reference expansion
  const toggleRefExpansion = (index) => {
    setExpandedRefs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8 md:col-span-1">
        {/* Summary Section */}
        <Card className="bg-white shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-2xl font-semibold" style={{ color: theme.primary }}>
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <p
              className={`text-base text-gray-700 leading-relaxed transition-all duration-300 ${
                isSummaryLong && !isSummaryExpanded ? 'line-clamp-5' : ''
              }`}
            >
              {circular.summary || 'No summary available.'}
            </p>
            {isSummaryLong && (
              <Button
                variant="link"
                className="mt-3 p-0 h-auto text-base font-medium"
                style={{ color: theme.primary }}
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              >
                {isSummaryExpanded ? (
                  <>
                    Show Less <ChevronUp className="ml-1 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="ml-1 h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Important Dates Section */}
        <Card className="bg-white shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-2xl font-semibold" style={{ color: theme.primary }}>
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {circular.important_dates?.length > 0 ? (
              <ul className="space-y-4">
                {circular.important_dates.map((date, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1">
                      <span
                        className="text-base font-medium"
                        style={{ color: theme.text }}
                      >
                        {date.description}
                      </span>
                      <span
                        className="text-base ml-2 px-2 py-1 rounded-md"
                        style={{ backgroundColor: theme.light, color: theme.primary }}
                      >
                        {date.date}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-gray-600">No important dates mentioned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-8 md:col-span-1">
        {/* Categories Section */}
        <Card className="bg-white shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-2xl font-semibold" style={{ color: theme.primary }}>
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-3">
              {categoryNames.length > 0 ? (
                categoryNames.map((category) => (
                  <Badge
                    key={category}
                    className="text-base font-medium rounded-full px-4 py-1.5"
                    style={{
                      backgroundColor: `${theme.light}80`,
                      color: theme.text,
                    }}
                  >
                    {category}
                  </Badge>
                ))
              ) : (
                <p className="text-base text-gray-600">No categories assigned.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Circular References Section */}
        <Card className="bg-white shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md relative">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="text-2xl font-semibold" style={{ color: theme.primary }}>
              Past Circular References ({pastRefs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
            {pastRefs.length > 0 ? (
              <div className="space-y-4">
                {pastRefs.map((ref, index) => {
                  const description = ref.deltaAnalysis || ref.description || 'No details available.';
                  const isLongDescription = description.split('\n').length > 3 || description.length > 150;
                  const isExpanded = expandedRefs[index];
                  const bgColor = index % 2 === 0 ? `${theme.light}80` : '#F5F5F5'; // Alternating colors

                  return (
                    <div
                      key={index}
                      className="w-full p-5 rounded-lg border border-gray-200 transition-all duration-200 hover:border-[${theme.primary}] hover:shadow-sm"
                      style={{ backgroundColor: bgColor }}
                    >
                      <h4
                        className="text-base font-medium mb-2 line-clamp-2"
                        style={{ color: theme.text }}
                      >
                        {ref.reference}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">{ref.date}</p>
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium block mb-3 transition-colors duration-200 hover:underline"
                          style={{ color: theme.primary }}
                        >
                          View Circular
                        </a>
                      )}
                      <p
                        className={`text-base text-gray-700 transition-all duration-300 ${
                          isLongDescription && !isExpanded ? 'line-clamp-3' : ''
                        }`}
                      >
                        {description}
                      </p>
                      {isLongDescription && (
                        <Button
                          variant="link"
                          className="mt-2 p-0 h-auto text-base font-medium"
                          style={{ color: theme.primary }}
                          onClick={() => toggleRefExpansion(index)}
                        >
                          {isExpanded ? (
                            <>
                              Show Less <ChevronUp className="ml-1 h-5 w-5" />
                            </>
                          ) : (
                            <>
                              Show More <ChevronDown className="ml-1 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-base text-gray-600">No past references found.</p>
            )}
            {/* Scroll Indicators */}
            {/* {pastRefs.length > 2 && (
              <>
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center opacity-75 pointer-events-none">
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                </div>
                <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center opacity-75 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                </div>
              </>
            )} */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;