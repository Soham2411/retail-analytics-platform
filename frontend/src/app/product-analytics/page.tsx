'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { FilterBar } from '@/components/FilterBar';
import ABCAnalysisChart from '@/components/charts/ABCAnalysisChart';
import ProfitabilityMatrixChart from '@/components/charts/ProfitabilityMatrixChart';
import SalesVelocityChart from '@/components/charts/SalesVelocityChart';
import CrossSellingChart from '@/components/charts/CrossSellingChart';

export default function ProductAnalytics() {
  const { filters, updateFilters } = useDashboardFilters();
  const [activeTab, setActiveTab] = useState('abc');
  const [abcData, setAbcData] = useState<any>(null);
  const [profitabilityData, setProfitabilityData] = useState<any>(null);
  const [velocityData, setVelocityData] = useState<any>(null);
  const [crossSellingData, setCrossSellingData] = useState<any>(null);
  const [loading, setLoading] = useState({ abc: false, profitability: false, velocity: false, crossSelling: false });

  // Fetch ABC Analysis data
  const fetchAbcData = async () => {
    setLoading(prev => ({ ...prev, abc: true }));
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      // Match your existing API parameter structure
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
      if (filters.regions.length > 0) params.append('regions', filters.regions.join(','));
      if (filters.customerSegments.length > 0) params.append('customer_segments', filters.customerSegments.join(','));

      const response = await fetch(`http://localhost:8000/api/filtered/product-analytics/abc-analysis?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setAbcData(result.data);
      }
    } catch (error) {
      console.error('Error fetching ABC data:', error);
    } finally {
      setLoading(prev => ({ ...prev, abc: false }));
    }
  };

  // Fetch Profitability Matrix data
  const fetchProfitabilityData = async () => {
    setLoading(prev => ({ ...prev, profitability: true }));
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
      if (filters.regions.length > 0) params.append('regions', filters.regions.join(','));
      if (filters.customerSegments.length > 0) params.append('customer_segments', filters.customerSegments.join(','));

      const response = await fetch(`http://localhost:8000/api/filtered/product-analytics/profitability-matrix?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setProfitabilityData(result.data);
      }
    } catch (error) {
      console.error('Error fetching profitability data:', error);
    } finally {
      setLoading(prev => ({ ...prev, profitability: false }));
    }
  };

  // Fetch Sales Velocity data
  const fetchVelocityData = async () => {
    setLoading(prev => ({ ...prev, velocity: true }));
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
      if (filters.regions.length > 0) params.append('regions', filters.regions.join(','));
      if (filters.customerSegments.length > 0) params.append('customer_segments', filters.customerSegments.join(','));

      const response = await fetch(`http://localhost:8000/api/filtered/product-analytics/sales-velocity?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setVelocityData(result.data);
      }
    } catch (error) {
      console.error('Error fetching velocity data:', error);
    } finally {
      setLoading(prev => ({ ...prev, velocity: false }));
    }
  };

  // Fetch Cross-selling data
  const fetchCrossSellingData = async () => {
    setLoading(prev => ({ ...prev, crossSelling: true }));
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
      if (filters.regions.length > 0) params.append('regions', filters.regions.join(','));
      if (filters.customerSegments.length > 0) params.append('customer_segments', filters.customerSegments.join(','));

      const response = await fetch(`http://localhost:8000/api/filtered/product-analytics/cross-selling?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setCrossSellingData(result.data);
      }
    } catch (error) {
      console.error('Error fetching cross-selling data:', error);
    } finally {
      setLoading(prev => ({ ...prev, crossSelling: false }));
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchAbcData();
    fetchProfitabilityData();
    fetchVelocityData();
    fetchCrossSellingData();
  }, [filters]);

  const tabs = [
    { id: 'abc', name: 'ABC Analysis', description: 'Pareto analysis and product classification' },
    { id: 'profitability', name: 'Profitability Matrix', description: 'Profit margin vs sales volume analysis' },
    { id: 'velocity', name: 'Sales Velocity', description: 'Growth trends and momentum tracking' },
    { id: 'cross-selling', name: 'Cross-selling', description: 'Product combinations and recommendations' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Product Performance Analytics</h1>
            <p className="mt-2 text-gray-600">
              Deep dive into product performance, profitability, and optimization opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFiltersChange={updateFilters} />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  <div>
                    <div className="font-semibold">{tab.name}</div>
                    <div className="text-xs mt-1">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'abc' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ABC Analysis</h2>
              <p className="text-gray-600 mt-2">
                Classify products based on the Pareto principle - identify the vital few that drive most revenue
              </p>
            </div>
            <ABCAnalysisChart data={abcData} loading={loading.abc} />
          </div>
        )}

        {activeTab === 'profitability' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profitability Matrix</h2>
              <p className="text-gray-600 mt-2">
                Analyze the relationship between profit margins and sales volumes to identify strategic opportunities
              </p>
            </div>
            <ProfitabilityMatrixChart data={profitabilityData} loading={loading.profitability} />
          </div>
        )}

        {activeTab === 'velocity' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sales Velocity Analysis</h2>
              <p className="text-gray-600 mt-2">
                Track product momentum and growth trends to identify rising stars and declining products
              </p>
            </div>
            <SalesVelocityChart data={velocityData} loading={loading.velocity} />
          </div>
        )}

        {activeTab === 'cross-selling' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Cross-selling Analysis</h2>
              <p className="text-gray-600 mt-2">
                Discover product combinations and develop recommendation strategies based on purchase patterns
              </p>
            </div>
            <CrossSellingChart data={crossSellingData} loading={loading.crossSelling} />
          </div>
        )}
      </div>
    </div>
  );
}