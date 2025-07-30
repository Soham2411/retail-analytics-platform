'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Target, DollarSign } from 'lucide-react';
import RFMSegmentChart from '@/components/dashboard/RFMSegmentChart';
import CLVDistributionChart from '@/components/dashboard/CLVDistributionChart';

interface RFMData {
  customers: any[];
  segments: any[];
  summary: {
    total_customers: number;
    total_revenue: number;
    average_customer_value: number;
    analysis_date: string;
  };
}

interface CLVData {
  customers: any[];
  distribution: any;
  summary: {
    total_customers: number;
    total_predicted_value: number;
    high_value_customers: number;
  };
}

export default function CustomerAnalyticsPage() {
  const [rfmData, setRfmData] = useState<RFMData | null>(null);
  const [clvData, setCLVData] = useState<CLVData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRFMData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/filtered/customer-analytics/rfm`);
      const data = await response.json();
      setRfmData(data);
    } catch (error) {
      console.error('Error fetching RFM data:', error);
    }
  };

  const fetchCLVData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/filtered/customer-analytics/clv`);
      const data = await response.json();
      setCLVData(data);
    } catch (error) {
      console.error('Error fetching CLV data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRFMData(), fetchCLVData()]);
      setLoading(false);
    };

    fetchData();
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

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Customer Analytics Dashboard</h1>
          <p className="text-gray-600">Deep dive into customer behavior, segmentation, and lifetime value</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rfmData?.summary.total_customers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${rfmData?.summary.total_revenue?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}
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
                  ${rfmData?.summary.average_customer_value?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}
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
                  {clvData?.summary.high_value_customers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 RFM Customer Segments</h3>
            {rfmData?.segments && <RFMSegmentChart data={rfmData.segments} />}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Customer Lifetime Value Analysis</h3>
            {clvData?.customers && clvData.customers.length > 0 ? (
              <CLVDistributionChart data={clvData.customers} />
            ) : (
              <div className="text-center py-8 text-gray-500">Loading CLV data...</div>
            )}
          </div>
        </div>

        {/* RFM Segments Overview */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🎯 Customer Segments (RFM Analysis)</h3>
            <p className="text-gray-600">Customer segmentation based on Recency, Frequency, and Monetary value</p>
          </div>
          <div className="p-6">
            {rfmData?.segments && rfmData.segments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rfmData.segments
                  .sort((a, b) => b.total_monetary - a.total_monetary)
                  .slice(0, 6)
                  .map((segment, index) => (
                    <div key={segment.rfm_segment} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{segment.rfm_segment}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {segment.customer_count} customers
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Total Revenue: ${segment.total_monetary.toLocaleString()}</p>
                        <p>Avg Value: ${segment.avg_monetary.toLocaleString()}</p>
                        <p>Avg Frequency: {segment.avg_frequency.toFixed(1)} orders</p>
                        <p>Avg Recency: {segment.avg_recency.toFixed(0)} days</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No segment data available</p>
            )}
          </div>
        </div>

        {/* Top Customers by CLV */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">💎 Top Customers by Predicted Lifetime Value</h3>
            <p className="text-gray-600">Your most valuable customers based on CLV analysis</p>
          </div>
          <div className="p-6">
            {clvData?.customers && clvData.customers.length > 0 ? (
              <div className="space-y-3">
                {clvData.customers
                  .sort((a, b) => b.predicted_clv - a.predicted_clv)
                  .slice(0, 10)
                  .map((customer, index) => (
                    <div key={customer.customer_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.customer_name}</p>
                          <p className="text-sm text-gray-500">
                            {customer.segment} • {customer.total_orders} orders • ${customer.total_spent.toLocaleString()} spent
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${customer.predicted_clv.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Predicted CLV</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No customer data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}