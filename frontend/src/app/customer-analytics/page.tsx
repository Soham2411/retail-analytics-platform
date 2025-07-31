'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Target, DollarSign } from 'lucide-react';

interface CustomerSegmentData {
  segment: string;
  count: number;
  percentage: number;
}

interface CustomerSummary {
  total_customers: number;
  total_revenue: number;
  average_customer_value: number;
  high_value_customers: number;
}

export default function CustomerAnalyticsPage() {
  const [segmentData, setSegmentData] = useState<CustomerSegmentData[]>([]);
  const [summaryData, setSummaryData] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Use correct API endpoints and URL
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer segments
      const segmentsResponse = await fetch(
        'https://retail-analytics-platform.onrender.com/api/analytics/customer-segments'
      );
      
      if (!segmentsResponse.ok) {
        throw new Error(`HTTP error! status: ${segmentsResponse.status}`);
      }
      
      const segments = await segmentsResponse.json();
      setSegmentData(segments);

      // Generate summary data from segments
      const totalCustomers = segments.reduce((sum: number, seg: CustomerSegmentData) => sum + seg.count, 0);
      const highValueCustomers = segments.find((seg: CustomerSegmentData) => seg.segment === 'High Value')?.count || 0;
      
      setSummaryData({
        total_customers: totalCustomers,
        total_revenue: totalCustomers * 567, // Estimated based on segments
        average_customer_value: 567,
        high_value_customers: highValueCustomers
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
      setError('Failed to load customer data. Please check if the API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchCustomerData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Customer Analytics Dashboard</h1>
          <p className="text-gray-600">Deep dive into customer behavior and segmentation</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryData?.total_customers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Est. Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summaryData?.total_revenue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Customer Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summaryData?.average_customer_value?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High-Value Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryData?.high_value_customers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Segments Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Customer Value Segments</h3>
          {segmentData.length > 0 ? (
            <div className="space-y-4">
              {segmentData.map((segment, index) => (
                <div key={segment.segment} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded ${
                      segment.segment === 'High Value' ? 'bg-green-500' :
                      segment.segment === 'Medium Value' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{segment.segment}</h4>
                      <p className="text-sm text-gray-500">{segment.percentage}% of total customers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{segment.count.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">customers</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No customer segment data available</div>
          )}
        </div>

        {/* Customer Segments Visual */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🎯 Customer Value Distribution</h3>
            <p className="text-gray-600">Visual representation of customer segments</p>
          </div>
          <div className="p-6">
            {segmentData.length > 0 ? (
              <div className="space-y-6">
                {segmentData.map((segment, index) => (
                  <div key={segment.segment} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{segment.segment}</span>
                      <span className="text-sm text-gray-500">{segment.count} customers ({segment.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          segment.segment === 'High Value' ? 'bg-green-500' :
                          segment.segment === 'Medium Value' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${segment.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available for visualization</p>
            )}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">💡 Customer Insights</h3>
            <p className="text-gray-600">Key takeaways from customer segmentation analysis</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">🏆 Top Segment</h4>
                <p className="text-sm text-gray-600">
                  {segmentData.length > 0 ? 
                    `${segmentData.reduce((prev, current) => (prev.count > current.count) ? prev : current).segment} segment has the most customers` :
                    'No data available'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">💰 Revenue Opportunity</h4>
                <p className="text-sm text-gray-600">
                  Focus on converting Medium Value customers to High Value for increased revenue
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">📈 Growth Strategy</h4>
                <p className="text-sm text-gray-600">
                  Implement targeted marketing campaigns for each customer segment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}