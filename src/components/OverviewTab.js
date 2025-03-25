import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Calendar, ExternalLink } from 'lucide-react';

const OverviewTab = ({ circular, colors }) => {
  // Default colors if none provided
  const defaultColors = {
    primary: '#3C4A94',
    hover: '#2D3970',
    light: '#D6D5E9',
    text: '#3C4A94',
    border: '#A5B4FC',
    shadow: 'rgba(60, 74, 148, 0.15)',
    accent: '#6366F1',
  };
  const theme = colors || defaultColors;

  // State for sub-sections (Summary and Delta Analysis) within past references
  const [openSubSections, setOpenSubSections] = useState({});

  // Extract category names and past references
  const categoryNames = circular.categories ? Object.keys(circular.categories) : [];
  const pastRefs = circular.past_circular_reference || [];

  // Toggle function for sub-sections
  const toggleSubSection = (refIndex, section) =>
    setOpenSubSections((prev) => ({
      ...prev,
      [`${refIndex}-${section}`]: !prev[`${refIndex}-${section}`],
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Summary Section (Visible by Default) */}
        <Card
          className="bg-white transition-all duration-300"
          style={{ borderColor: theme.border, boxShadow: `0 4px 12px ${theme.shadow}` }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="text-xl font-semibold" style={{ color: theme.primary }}>
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {circular.summary ? (
              <p className="text-gray-700 leading-relaxed">{circular.summary}</p>
            ) : (
              <p className="text-gray-500 italic">No summary available for this circular.</p>
            )}
          </CardContent>
        </Card>

        {/* Important Dates */}
        <Card
          className="bg-white transition-all duration-300"
          style={{ borderColor: theme.border, boxShadow: `0 4px 12px ${theme.shadow}` }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="text-xl font-semibold" style={{ color: theme.primary }}>
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {circular.important_dates?.length > 0 ? (
              <ul className="space-y-4">
                {circular.important_dates.map((date, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-[${theme.light}]"
                  >
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="text-base font-medium" style={{ color: theme.text }}>
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
              <p className="text-gray-500 italic">No important dates mentioned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Categories */}
        <Card
          className="bg-white transition-all duration-300"
          style={{ borderColor: theme.border, boxShadow: `0 4px 12px ${theme.shadow}` }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="text-xl font-semibold" style={{ color: theme.primary }}>
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-3">
              {categoryNames.length > 0 ? (
                categoryNames.map((category) => (
                  <Badge
                    key={category}
                    className="text-sm font-medium rounded-full px-3 py-1 transition-all duration-200 hover:bg-[${theme.hover}] hover:text-white"
                    style={{ backgroundColor: theme.light, color: theme.text }}
                  >
                    {category}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 italic">No categories assigned.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Circular References (No Top-Level Accordion) */}
        <Card
          className="bg-white transition-all duration-300"
          style={{ borderColor: theme.border, boxShadow: `0 4px 12px ${theme.shadow}` }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="text-xl font-semibold" style={{ color: theme.primary }}>
              Past Circular References ({pastRefs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {pastRefs.length > 0 ? (
              <div className="space-y-4">
                {pastRefs.map((ref, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 transition-all duration-200 hover:bg-[${theme.light}20]"
                    style={{ borderColor: theme.border }}
                  >
                    {/* Reference Header */}
                    <div className="mb-3">
                      <h4
                        className="text-base font-medium line-clamp-1"
                        style={{ color: theme.text }}
                      >
                        {ref.reference}
                      </h4>
                      <p className="text-sm text-gray-500">{ref.date}</p>
                    </div>

                    {/* View Circular Link (if available) */}
                    {ref.url && (
                      <div className="mb-3">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm transition-colors duration-200 hover:underline"
                          style={{ color: theme.primary }}
                        >
                          View Circular <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}

                    {/* Summary Sub-Accordion */}
                    <div className="mb-3">
                      <div
                        className="flex justify-between items-center cursor-pointer p-2 rounded-md transition-colors duration-200 hover:bg-[${theme.light}]"
                        onClick={() => toggleSubSection(index, 'summary')}
                      >
                        <h5 className="text-sm font-semibold" style={{ color: theme.text }}>
                          Summary
                        </h5>
                        {openSubSections[`${index}-summary`] ? (
                          <ChevronUp className="h-4 w-4" style={{ color: theme.primary }} />
                        ) : (
                          <ChevronDown className="h-4 w-4" style={{ color: theme.primary }} />
                        )}
                      </div>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openSubSections[`${index}-summary`] ? 'max-h-[300px] mt-2' : 'max-h-0'
                        }`}
                      >
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {ref.summary || (
                            <span className="text-gray-500 italic">No summary available</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Delta Analysis Sub-Accordion */}
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer p-2 rounded-md transition-colors duration-200 hover:bg-[${theme.light}]"
                        onClick={() => toggleSubSection(index, 'delta')}
                      >
                        <h5 className="text-sm font-semibold" style={{ color: theme.text }}>
                          Delta Analysis
                        </h5>
                        {openSubSections[`${index}-delta`] ? (
                          <ChevronUp className="h-4 w-4" style={{ color: theme.primary }} />
                        ) : (
                          <ChevronDown className="h-4 w-4" style={{ color: theme.primary }} />
                        )}
                      </div>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openSubSections[`${index}-delta`] ? 'max-h-[300px] mt-2' : 'max-h-0'
                        }`}
                      >
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {ref.deltaAnalysis || (
                            <span className="text-gray-500 italic">No delta analysis available</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No past references found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;