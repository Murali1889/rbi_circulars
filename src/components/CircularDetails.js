import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton"; // Import ShadCN Skeleton
import OverviewTab from './OverviewTab';
import ImpactedTab from './ImpactedTab';

// Define color schemes based on type (consistent with CircularList)
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
        primary: '#3C4A94', // Default purple
        hover: '#2D3970',
        light: '#D6D5E9',
        text: '#3C4A94',
      };
  }
};

// Skeleton for loading state
const CircularDetailSkeleton = ({ colors }) => (
  <div className="max-w-7xl mx-auto px-4 py-6">
    <Skeleton className="h-6 w-32 mb-6" style={{ backgroundColor: `${colors.light}80` }} />
    <Card className="bg-white shadow-sm">
      <CardHeader className="border-b">
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
        console.log('Fetched circular:', data);
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
      <div className="min-h-screen" style={{ backgroundColor: `${colors.light}40` }}>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium" style={{ color: colors.primary }}>
            Circular not found
          </h3>
          <p className="mt-2 text-gray-500">
            The circular you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 rounded-md transition-colors duration-200"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: `${colors.light}40` }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 transition-colors duration-200"
          style={{ color: colors.primary }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circulars
        </button>

        {/* Main Content */}
        <Card className="bg-white shadow-sm transition-shadow duration-200">
          <CardHeader className="border-b">
            <div className="space-y-4">
              <CardTitle className="text-2xl" style={{ color: colors.primary }}>
                {circular.title}
              </CardTitle>
              <div className="flex flex-wrap gap-4">
                {(circular?.documentUrl || circular?.url) && (
                  <a
                    href={circular.documentUrl || circular.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200"
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
                    className="inline-flex items-center gap-2 px-4 py-2 border rounded-md transition-colors duration-200"
                    style={{ borderColor: colors.primary, color: colors.primary }}
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
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-white">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:text-[${colors.primary}] rounded-none px-6 py-3 transition-colors duration-200"
                  style={{ borderColor: colors.primary, color: colors.text }}
                >
                  Circular Overview
                </TabsTrigger>
                <TabsTrigger
                  value="impacted"
                  className="data-[state=active]:border-b-2 data-[state=active]:text-[${colors.primary}] rounded-none px-6 py-3 transition-colors duration-200"
                  style={{ borderColor: colors.primary, color: colors.text }}
                >
                  Impacted Clients and Products
                </TabsTrigger>
              </TabsList>
              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <OverviewTab circular={circular} />
                </TabsContent>
                <TabsContent value="impacted" className="mt-0">
                  <ImpactedTab circular={circular} />
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