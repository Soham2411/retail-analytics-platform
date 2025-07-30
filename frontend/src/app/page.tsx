'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { RefreshCw, Globe, Target, Brain, TrendingUp, Users, Package } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [useFiltering, setUseFiltering] = useState(false);
  
  const {
    filters,
    data,
    isLoading,
    hasActiveFilters,
    filterSummary,
    updateFilters,
    refreshData
  } = useDashboardFilters();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Main Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Real-time business insights powered by Python & PostgreSQL
                {hasActiveFilters && ` • ${filterSummary}`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Toggle between regular and filtered view */}
              <button
                onClick={() => setUseFiltering(!useFiltering)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  useFiltering 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {useFiltering ? '🔍 Filtering ON' : '🔍 Enable Filtering'}
              </button>
              
              {useFiltering && (
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Access to Advanced Features */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Advanced Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/geographic-analytics" className="group">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white hover:shadow-lg transition-all duration-200 transform group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Geographic Analytics</h3>
                    <p className="text-sm opacity-90">Interactive heatmaps & regional insights</p>
                  </div>
                  <Globe className="h-8 w-8 opacity-80" />
                </div>
              </div>
            </Link>

            <Link href="/executive-dashboard" className="group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white hover:shadow-lg transition-all duration-200 transform group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Executive Dashboard</h3>
                    <p className="text-sm opacity-90">AI-powered business insights</p>
                  </div>
                  <Target className="h-8 w-8 opacity-80" />
                </div>
              </div>
            </Link>

            <Link href="/forecasting" className="group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white hover:shadow-lg transition-all duration-200 transform group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Sales Forecasting</h3>
                    <p className="text-sm opacity-90">ML-powered predictions</p>
                  </div>
                  <Brain className="h-8 w-8 opacity-80" />
                </div>
              </div>
            </Link>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">More Coming Soon</h3>
                  <p className="text-sm opacity-90">Advanced features in development</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar - Only show when filtering is enabled */}
        {useFiltering && (
          <div className="mb-8">
            <FilterBar
              filters={filters}
              onFiltersChange={updateFilters}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Content */}
        {useFiltering ? (
          // FILTERED VIEW
          <FilteredDashboard 
            data={data} 
            isLoading={isLoading} 
            hasActiveFilters={hasActiveFilters} 
          />
        ) : (
          // ORIGINAL VIEW (Static components that don't make API calls)
          <OriginalDashboard />
        )}
      </div>
    </div>
  );
}

// Original Dashboard Component (enhanced with more features showcase)
const OriginalDashboard = () => {
  return (
    <>
      {/* Static KPI Cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">$2.3M</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">793</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">5,009</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">12%</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Customer Analytics Preview */}
        <Link href="/customer-analytics" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                👥 Customer Analytics
              </h3>
              <Users className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">RFM Segmentation</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer Lifetime Value</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cohort Analysis</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-blue-600 group-hover:text-blue-700">
              Click to explore detailed customer insights →
            </div>
          </div>
        </Link>

        {/* Product Analytics Preview */}
        <Link href="/product-analytics" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                📦 Product Analytics
              </h3>
              <Package className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ABC Analysis</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profitability Matrix</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cross-selling Analysis</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-purple-600 group-hover:text-purple-700">
              Click to explore product performance →
            </div>
          </div>
        </Link>

        {/* Platform Features */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Platform Features</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Real-time KPI monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Interactive filtering & drill-down</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Geographic heatmaps</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">AI-powered insights</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-sm text-gray-600">Sales forecasting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🔄</span>
              <span className="text-sm text-gray-600">Advanced ML predictions</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Tech Stack:</strong> Python FastAPI, PostgreSQL, React, TypeScript, Tailwind CSS
            </p>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Sales Trends</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Click "Enable Filtering" to see interactive charts</p>
              <p className="text-sm text-blue-600">Or explore advanced analytics above ↑</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 Regional Performance</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Interactive charts available with filtering</p>
              <Link href="/geographic-analytics" className="text-sm text-blue-600 hover:text-blue-700">
                Or view Geographic Analytics →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/executive-dashboard" className="block">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <span className="text-sm font-medium text-purple-900">Executive Summary</span>
                <Target className="h-4 w-4 text-purple-600" />
              </div>
            </Link>
            <Link href="/forecasting" className="block">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-sm font-medium text-green-900">Sales Forecast</span>
                <Brain className="h-4 w-4 text-green-600" />
              </div>
            </Link>
            <Link href="/geographic-analytics" className="block">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-sm font-medium text-blue-900">Geographic Insights</span>
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Rest of your existing components stay the same...
const FilteredDashboard = ({ data, isLoading, hasActiveFilters }: any) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading filtered data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtered KPI Cards */}
      <FilteredKPICards data={data.kpis} isFiltered={hasActiveFilters} />

      {/* Filtered Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md relative">
          {hasActiveFilters && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="Filtered data"></div>}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Sales Trends (Filtered)</h3>
          <FilteredSalesChart data={data.salesTrends} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md relative">
          {hasActiveFilters && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="Filtered data"></div>}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 Regional Performance (Filtered)</h3>
          <FilteredRegionalChart data={data.regionalPerformance} />
        </div>
      </div>

      {/* Top Products Table */}
      <TopProductsTable products={data.topProducts} isFiltered={hasActiveFilters} />
    </div>
  );
};

const FilteredKPICards = ({ data, isFiltered }: any) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  
  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        {isFiltered && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="Filtered data"></div>}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.total_sales)}</p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        {isFiltered && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="Filtered data"></div>}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Customers</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.unique_customers)}</p>
          </div>
          <div className="text-3xl">👥</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        {isFiltered && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="Filtered data"></div>}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Orders</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.total_orders)}</p>
          </div>
          <div className="text-3xl">📦</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        {isFiltered && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" title="Filtered data"></div>}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Profit Margin</p>
            <p className="text-2xl font-bold text-gray-900">{data.profit_margin}%</p>
          </div>
          <div className="text-3xl">📈</div>
        </div>
      </div>
    </div>
  );
};

const FilteredSalesChart = ({ data }: any) => {
  if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;
  
  return (
    <div className="h-64">
      <div className="grid grid-cols-4 gap-2 h-full">
        {data.slice(0, 4).map((item: any, index: number) => (
          <div key={index} className="flex flex-col justify-end">
            <div 
              className="bg-blue-500 rounded-t"
              style={{ 
                height: `${Math.min((item.sales / Math.max(...data.map((d: any) => d.sales))) * 100, 100)}%`,
                minHeight: '20px'
              }}
            ></div>
            <div className="text-xs text-center mt-2 text-gray-600">
              {item.month}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FilteredRegionalChart = ({ data }: any) => {
  if (!data || data.length === 0) return <div className="text-gray-500">No data available</div>;

  return (
    <div className="space-y-3">
      {data.slice(0, 4).map((item: any, index: number) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm font-medium">{item.region}</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${(item.sales / Math.max(...data.map((d: any) => d.sales))) * 100}%` 
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-600">{item.orders}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TopProductsTable = ({ products, isFiltered }: any) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          🏆 Top Products {isFiltered && '(Filtered)'}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.product_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{product.total_quantity.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(product.total_sales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};