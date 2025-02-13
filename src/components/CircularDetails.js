import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const CircularDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCircularById } = useData();
  const [circular, setCircular] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCircular = async () => {
      try {
        const data = await getCircularById(id);
        if (data) {
          setCircular(data);
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
  }, [id, getCircularById, navigate]);

  const renderOverviewTab = () => {
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
                {circular.important_dates?.map((date, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="font-medium text-[#3C4A94]">{date.description}</span>
                    <span className="text-gray-600">{date.date}</span>
                  </div>
                ))}
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
              <div className="space-y-3">
                {circular.past_circular_references?.map((ref, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#3C4A94] font-medium">Reference:</span>
                      <span className="text-gray-600">{ref.reference || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#3C4A94] font-medium">Relationship:</span>
                      <span className="text-gray-600">{ref.relationship}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#3C4A94] font-medium">Date:</span>
                      <span className="text-gray-600">{ref.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderImpactedTab = () => {
    return (
      <div className="space-y-6">
        {/* Impacted Clients */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">List of clients potentially impacted (By category)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Not provided</p>
          </CardContent>
        </Card>

        {/* Impacted Products */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#3C4A94] text-xl">List of HV's product mentioned/impacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {circular.impacted_products?.map((product, index) => (
                <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-[#3C4A94]">{product.product_title}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.impact_level === 'HIGH' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-[#D6D5E9] text-[#3C4A94]'
                    }`}>
                      {product.impact_level} 
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{product.impact_description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-[#3C4A94]">Compliance Deadline:</span>
                      <span className="text-gray-600">{product.compliance_deadline}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-[#3C4A94] text-sm">Required Actions:</span>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {product.required_actions?.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>
                    {product.product_url && (
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3C4A94] hover:text-[#2d3970] text-sm inline-flex items-center gap-1"
                      >
                        View Product Details
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

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
            <CardTitle className="text-2xl text-[#3C4A94]">{circular.title}</CardTitle>
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
                  Impacted clients and Products
                </TabsTrigger>
              </TabsList>
              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  {renderOverviewTab()}
                </TabsContent>
                <TabsContent value="impacted" className="mt-0">
                  {renderImpactedTab()}
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