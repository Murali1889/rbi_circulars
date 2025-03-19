import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import OverviewTab from './OverviewTab';
import ImpactedTab from './ImpactedTab';

const CircularDetail = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCircularById, circulars } = useData();
  const [circular, setCircular] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(circular)

  useEffect(() => {
    const fetchCircular = async () => {
      try {
        const data = await getCircularById(type, id);
        console.log(data)
        if (data) {
          setCircular({
            ...data,
          });
        } else {
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error fetching circular:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCircular();
  }, [id, getCircularById, navigate, circulars]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-[#3C4A94] rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!circular) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-[#3C4A94]">Circular not found</h3>
        <p className="mt-2 text-gray-500">
          The circular you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-[#3C4A94] text-white rounded-md hover:bg-[#2d3970] transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6D5E9] bg-opacity-30">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#3C4A94] hover:text-[#2d3970] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circulars
        </button>

        {/* Main Content */}
        <Card className="bg-white shadow-lg">
          {/* Header */}
          <CardHeader className="border-b">
            <div className="space-y-4">
              <CardTitle className="text-2xl text-[#3C4A94]">{circular.title}</CardTitle>

              {/* Document Actions */}
              <div className="flex flex-wrap gap-4">
                {(circular?.documentUrl || circular?.url ) && (
                  <a
                    href={circular.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#3C4A94] text-white rounded-md hover:bg-[#2d3970] transition-colors"
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
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#3C4A94] text-[#3C4A94] rounded-md hover:bg-[#D6D5E9] transition-colors"
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
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#3C4A94] data-[state=active]:text-[#3C4A94] rounded-none px-6 py-3"
                >
                  Circular Overview
                </TabsTrigger>
                <TabsTrigger
                  value="impacted"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#3C4A94] data-[state=active]:text-[#3C4A94] rounded-none px-6 py-3"
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