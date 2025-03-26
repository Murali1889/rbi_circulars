import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import OverviewTab from './OverviewTab';
import ImpactedTab from './ImpactedTab';

const getTypeColors = (type) => {
  switch (type.toLowerCase()) {
    case 'sebi':
      return {
        primary: '#1E3A8A', // Deep blue
        hover: '#172554',   // Darker blue
        light: '#DBEAFE',   // Light blue background
        text: '#1E3A8A',    // Matching text
        border: '#93C5FD',  // Soft blue border
        shadow: 'rgba(30, 58, 138, 0.15)', // Subtle blue shadow
        accent: '#3B82F6',  // Bright blue accent
      };
    case 'irdai':
      return {
        primary: '#047857', // Emerald green
        hover: '#065F46',   // Darker green
        light: '#D1FAE5',   // Light green background
        text: '#047857',    // Matching text
        border: '#6EE7B7',  // Soft green border
        shadow: 'rgba(4, 120, 87, 0.15)', // Subtle green shadow
        accent: '#10B981',  // Vibrant green accent
      };
    case 'meity':
      return {
        primary: '#1A3C34', // Deep teal/charcoal
        hover: '#122C26',   // Darker teal
        light: '#D1E8E2',   // Soft muted teal background
        text: '#1A3C34',    // Matching text
        border: '#7AB8A8',  // Smooth teal border
        shadow: 'rgba(26, 60, 52, 0.2)', // Subtle dark teal shadow
        accent: '#2D6A5D',  // Rich teal accent
      };
    default:
      return {
        primary: '#3C4A94', // Default purple-blue
        hover: '#2D3970',   // Darker shade
        light: '#D6D5E9',   // Light purple background
        text: '#3C4A94',    // Matching text
        border: '#A5B4FC',  // Soft purple border
        shadow: 'rgba(60, 74, 148, 0.15)', // Subtle shadow
        accent: '#6366F1',  // Vibrant purple accent
      };
  }
};

const CircularDetailSkeleton = ({ colors }) => (
  <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
    <Skeleton className="h-6 w-32 mb-6" style={{ backgroundColor: `${colors.light}80` }} />
    <Card className="bg-white">
      <CardHeader className="border-b" style={{ borderColor: colors.border }}>
        <Skeleton className="h-8 w-3/4" style={{ backgroundColor: `${colors.light}80` }} />
        <div className="flex flex-wrap gap-4 mt-4">
          <Skeleton className="h-10 w-32 rounded-md" style={{ backgroundColor: `${colors.light}80` }} />
          <Skeleton className="h-10 w-36 rounded-md" style={{ backgroundColor: `${colors.light}80` }} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Skeleton className="h-10 w-full mb-4" style={{ backgroundColor: `${colors.light}80` }} />
        <Skeleton className="h-64 w-full" style={{ backgroundColor: `${colors.light}80` }} />
      </CardContent>
    </Card>
  </div>
);

const CircularDetail = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCircularById, circulars } = useData();
  const [circular, setCircular] = useState(null);
  const [loading, setLoading] = useState(true);
  const colors = getTypeColors(type);

  useEffect(() => {
    const fetchCircular = async () => {
      try {
        const data = await getCircularById(type, id);
        if (data) {
          setCircular({ ...data });
        } else {
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error fetching circular:', error);
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };
    fetchCircular();
  }, [id, getCircularById, navigate, circulars, type]);

  if (loading) {
    return <CircularDetailSkeleton colors={colors} />;
  }

  if (!circular) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: `${colors.light}20` }}>
        <div className="text-center py-12 animate-fade-in">
          <h3 className="text-lg font-medium" style={{ color: colors.primary }}>
            Circular Not Found
          </h3>
          <p className="mt-2 text-gray-500">
            The circular you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 rounded-md transition-all duration-200 hover:bg-[${colors.hover}]"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-300" style={{ backgroundColor: `${colors.light}20` }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 transition-all duration-200 hover:text-[${colors.hover}] hover:translate-x-[-4px]"
          style={{ color: colors.primary }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circulars
        </button>

        <Card
          className="bg-white transition-all duration-300"
          style={{ borderColor: colors.border, boxShadow: `0 6px 16px ${colors.shadow}` }}
        >
          <CardHeader className="border-b" style={{ borderColor: colors.border }}>
            <div className="space-y-4">
              <CardTitle className="text-2xl font-semibold" style={{ color: colors.primary }}>
                {circular.title}
              </CardTitle>
              <div className="flex flex-wrap gap-4">
                {(circular?.documentUrl || circular?.url) && (
                  <a
                    href={circular.documentUrl || circular.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 hover:bg-[${colors.hover}]"
                    style={{ backgroundColor: colors.primary, color: 'white' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Document
                  </a>
                )}
                {circular?.pdfUrl && (
                  <a
                    href={circular.pdfUrl}
                    target="_blank"
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 border rounded-md transition-all duration-200 hover:bg-[${colors.light}]"
                    style={{ borderColor: colors.border, color: colors.primary }}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList
                className="w-full justify-start border-b rounded-none h-auto p-0 bg-white"
                style={{ borderColor: colors.border }}
              >
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:text-white rounded-none px-6 py-3 transition-all duration-200 hover:bg-[${colors.light}]"
                  style={{
                    borderColor: colors.accent,
                    color: colors.text,
                    backgroundColor: 'transparent',
                  }}
                >
                  Circular Overview
                </TabsTrigger>
                <TabsTrigger
                  value="impacted"
                  className="data-[state=active]:border-b-2 data-[state=active]:text-white rounded-none px-6 py-3 transition-all duration-200 hover:bg-[${colors.light}]"
                  style={{
                    borderColor: colors.accent,
                    color: colors.text,
                    backgroundColor: 'transparent',
                  }}
                >
                  Impacted Clients and Products
                </TabsTrigger>
              </TabsList>
              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <OverviewTab circular={circular} colors={colors} />
                </TabsContent>
                <TabsContent value="impacted" className="mt-0">
                  <ImpactedTab circular={circular} colors={colors} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CircularDetail;