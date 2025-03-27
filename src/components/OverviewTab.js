import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Calendar, ExternalLink, X } from 'lucide-react';

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
  // State for showing the popup
  const [selectedRef, setSelectedRef] = useState(null);

  // Extract category names, past references, and summary
  const categoryNames = circular.categories ? Object.keys(circular.categories) : [];
  const pastRefs = circular.past_circular_reference || [];
  const summaryPoints = circular.summary ? circular.summary.split('\n') : [];

  // Toggle function for sub-sections
  const toggleSubSection = (refIndex, section) =>
    setOpenSubSections((prev) => ({
      ...prev,
      [`${refIndex}-${section}`]: !prev[`${refIndex}-${section}`],
    }));

  // Function to parse summary or delta text into bullet points
  const parseBulletPoints = (text) => {
    if (!text || typeof text !== 'string') return [];

    // For past_summary: Split by newlines and filter out empty lines
    if (text.startsWith('-')) {
      return text
        .split('\n')
        .filter((line) => line.trim().startsWith('-') && line.replace('-', '').trim())
        .map((line) => line.replace(/^- /, '').trim());
    }

    // For delta: Parse the structured format
    const sections = { additions: [], modifications: [], removals: [] };
    const additionsMatch = text.match(/Additions:\n([\s\S]*?)(Modifications:|Removals:|$)/);
    const modificationsMatch = text.match(/Modifications:\n([\s\S]*?)(Removals:|$)/);
    const removalsMatch = text.match(/Removals:\n([\s\S]*?)$/);

    if (additionsMatch) {
      sections.additions = additionsMatch[1]
        .split('\n')
        .filter((line) => line.trim().startsWith('•') && line.replace('•', '').trim())
        .map((line) => line.replace(/^• /, '').trim());
    }
    if (modificationsMatch) {
      sections.modifications = modificationsMatch[1]
        .split('\n')
        .filter((line) => line.trim().startsWith('•') && line.replace('•', '').trim())
        .map((line) => line.replace(/^• /, '').trim());
    }
    if (removalsMatch) {
      sections.removals = removalsMatch[1]
        .split('\n')
        .filter((line) => line.trim().startsWith('•') && line.replace('•', '').trim())
        .map((line) => line.replace(/^• /, '').trim());
    }

    return sections;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Summary Section */}
        <Card
          className="bg-white transition-all duration-300"
          style={{ borderColor: theme.border, boxShadow: `0 4px 12px ${theme.shadow}` }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="text-xl font-semibold" style={{ color: theme.primary }}>
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {circular.summary ? (
              <ul className="text-gray-700 leading-relaxed list-disc pl-5 space-y-2">
                {summaryPoints.map((point, index) => (
                  <li key={index}>{point.replace(/^- /, '')}</li>
                ))}
              </ul>
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
                    className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                  >
                    <Calendar className="h-5 w-5 mt-1" style={{ color: theme.primary }} />
                    <div className="flex-1">
                      <span className="text-base font-medium block" style={{ color: theme.text }}>
                        {date.description}
                      </span>
                      <span
                        className="text-base font-semibold px-2 py-1 rounded-md mt-1 inline-block"
                        style={{ backgroundColor: theme.accent, color: '#ffffff' }}
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

        {/* Past Circular References */}
        <Card
          className="bg-white transition-all duration-300"
          style={{ borderColor: theme.border, boxShadow: `0 4px 12px ${theme.shadow}` }}
        >
          <CardHeader className="border-b" style={{ borderColor: theme.border }}>
            <CardTitle className="text-xl font-semibold" style={{ color: theme.primary }}>
              Past Circular References ({pastRefs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {pastRefs.length > 0 ? (
              <div className="space-y-6">
                {pastRefs.map((ref, index) => {
                  const summaryPoints = parseBulletPoints(ref.past_summary);
                  const deltaSections = parseBulletPoints(ref.delta);
                  const hasMoreSummary = summaryPoints.length > 3;
                  const hasMoreDelta =
                    deltaSections.additions.length +
                      deltaSections.modifications.length +
                      deltaSections.removals.length >
                    3;

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 transition-all duration-200 hover:bg-gray-50"
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
                            className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200 hover:underline"
                            style={{ color: theme.primary }}
                          >
                            View Circular
                            <ExternalLink
                              className="h-4 w-4"
                              style={{ color: theme.primary }}
                            />
                          </a>
                        </div>
                      )}

                      {/* Summary Sub-Accordion */}
                      <div className="mb-3">
                        <div
                          className="flex justify-between items-center cursor-pointer p-2 rounded-md transition-colors duration-200 hover:bg-gray-100"
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
                            openSubSections[`${index}-summary`]
                              ? 'max-h-[300px] mt-2'
                              : 'max-h-0'
                          }`}
                        >
                          {summaryPoints.length > 0 ? (
                            <>
                              <ul className="text-gray-700 text-sm leading-relaxed list-disc pl-5 space-y-1">
                                {summaryPoints.slice(0, 3).map((point, idx) => (
                                  <li key={idx}>{point}</li>
                                ))}
                              </ul>
                              {hasMoreSummary && (
                                <button
                                  onClick={() => setSelectedRef(ref)}
                                  className="mt-2 flex items-center gap-1 text-sm font-medium transition-colors duration-200 hover:underline"
                                  style={{ color: theme.primary }}
                                >
                                  Show More
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500 italic text-sm">No summary available</p>
                          )}
                        </div>
                      </div>

                      {/* Delta Analysis Sub-Accordion */}
                      <div>
                        <div
                          className="flex justify-between items-center cursor-pointer p-2 rounded-md transition-colors duration-200 hover:bg-gray-100"
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
                            openSubSections[`${index}-delta`]
                              ? 'max-h-[400px] mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
                              : 'max-h-0'
                          }`}
                        >
                          {deltaSections.additions.length > 0 ||
                          deltaSections.modifications.length > 0 ||
                          deltaSections.removals.length > 0 ? (
                            <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                              {deltaSections.additions.length > 0 && (
                                <div>
                                  <h6 className="font-semibold text-gray-800">Additions:</h6>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {deltaSections.additions.slice(0, 3).map((point, idx) => (
                                      <li key={idx}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {deltaSections.modifications.length > 0 && (
                                <div>
                                  <h6 className="font-semibold text-gray-800">Modifications:</h6>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {deltaSections.modifications
                                      .slice(
                                        0,
                                        3 -
                                          (deltaSections.additions.length > 3
                                            ? 3
                                            : deltaSections.additions.length)
                                      )
                                      .map((point, idx) => (
                                        <li key={idx}>{point}</li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                              {deltaSections.removals.length > 0 && (
                                <div>
                                  <h6 className="font-semibold text-gray-800">Removals:</h6>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {deltaSections.removals
                                      .slice(
                                        0,
                                        3 -
                                          (deltaSections.additions.length > 3
                                            ? 3
                                            : deltaSections.additions.length) -
                                          (deltaSections.modifications.length >
                                          3 - deltaSections.additions.length
                                            ? 3 - deltaSections.additions.length
                                            : deltaSections.modifications.length)
                                      )
                                      .map((point, idx) => (
                                        <li key={idx}>{point}</li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                              {hasMoreDelta && (
                                <button
                                  onClick={() => setSelectedRef(ref)}
                                  className="mt-2 flex items-center gap-1 text-sm font-medium transition-colors duration-200 hover:underline"
                                  style={{ color: theme.primary }}
                                >
                                  Show More
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic text-sm">
                              No delta analysis available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No past references found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popup for Full Past Circular Reference Details */}
      {selectedRef && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{ borderColor: theme.border, boxShadow: `0 4px 12px ${theme.shadow}` }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
                {selectedRef.reference}
              </h3>
              <button onClick={() => setSelectedRef(null)}>
                <X className="h-6 w-6" style={{ color: theme.primary }} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedRef.date}</p>
            {selectedRef.url && (
              <div className="mb-4">
                <a
                  href={selectedRef.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200 hover:underline"
                  style={{ color: theme.primary }}
                >
                  View Circular
                  <ExternalLink className="h-4 w-4" style={{ color: theme.primary }} />
                </a>
              </div>
            )}
            <div className="space-y-6">
              {/* Full Summary */}
              <div>
                <h4 className="text-base font-semibold mb-2" style={{ color: theme.text }}>
                  Summary
                </h4>
                {parseBulletPoints(selectedRef.past_summary).length > 0 ? (
                  <ul className="text-gray-700 text-sm leading-relaxed list-disc pl-5 space-y-1">
                    {parseBulletPoints(selectedRef.past_summary).map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-sm">No summary available</p>
                )}
              </div>

              {/* Full Delta Analysis */}
              <div>
                <h4 className="text-base font-semibold mb-2" style={{ color: theme.text }}>
                  Delta Analysis
                </h4>
                {parseBulletPoints(selectedRef.delta).additions.length > 0 ||
                parseBulletPoints(selectedRef.delta).modifications.length > 0 ||
                parseBulletPoints(selectedRef.delta).removals.length > 0 ? (
                  <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                    {parseBulletPoints(selectedRef.delta).additions.length > 0 && (
                      <div>
                        <h6 className="font-semibold text-gray-800">Additions:</h6>
                        <ul className="list-disc pl-5 space-y-1">
                          {parseBulletPoints(selectedRef.delta).additions.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {parseBulletPoints(selectedRef.delta).modifications.length > 0 && (
                      <div>
                        <h6 className="font-semibold text-gray-800">Modifications:</h6>
                        <ul className="list-disc pl-5 space-y-1">
                          {parseBulletPoints(selectedRef.delta).modifications.map(
                            (point, idx) => (
                              <li key={idx}>{point}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    {parseBulletPoints(selectedRef.delta).removals.length > 0 && (
                      <div>
                        <h6 className="font-semibold text-gray-800">Removals:</h6>
                        <ul className="list-disc pl-5 space-y-1">
                          {parseBulletPoints(selectedRef.delta).removals.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No delta analysis available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;