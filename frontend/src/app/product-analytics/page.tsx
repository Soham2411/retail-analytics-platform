'use client';

import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Target, DollarSign, BarChart3 } from 'lucide-react';

interface ProductData {
  category: string;
  total_sales: number;
  total_orders: number;
  total_quantity: number;
}

interface TopProduct {
  product_name: string;
  category: string;
  total_quantity: number;
  total_sales: number;
}

export default function ProductAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryData, setCategoryData] = useState<ProductData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Use correct API endpoints and URL
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category analysis
      const categoryResponse = await fetch(
        'https://retail-analytics-platform.onrender.com/api/analytics/category-analysis'
      );
      
      if (!categoryResponse.ok) {
        throw new Error(`HTTP error! status: ${categoryResponse.status}`);
      }
      
      const categories = await categoryResponse.json();
      setCategoryData(categories);

      // Fetch top products
      const productsResponse = await fetch(
        'https://retail-analytics-platform.onrender.com/api/analytics/top-products?limit=10'
      );
      
      if (!productsResponse.ok) {
        throw new Error(`HTTP error! status: ${productsResponse.status}`);
      }
      
      const products = await productsResponse.json();
      setTopProducts(products);

    } catch (error) {
      console.error('Error fetching product data:', error);
      setError('Failed to load product data. Please check if the API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'categories', name: 'Category Analysis', icon: Package },
    { id: 'top-products', name: 'Top Products', icon: TrendingUp },
    { id: 'insights', name: 'Insights', icon: Target }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product analytics...</p>
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
              onClick={fetchProductData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalSales = categoryData.reduce((sum, cat) => sum + cat.total_sales, 0);
  const totalOrders = categoryData.reduce((sum, cat) => sum + cat.total_orders, 0);
  const totalQuantity = categoryData.reduce((sum, cat) => sum + cat.total_quantity, 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">📦 Product Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Deep dive into product performance, categories, and optimization opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Product Sales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Units Sold</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Product Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categories:</span>
                      <span className="font-medium">{categoryData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-medium">{topProducts.length}+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(totalSales)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Sales per Category:</span>
                      <span className="font-medium">
                        {formatCurrency(categoryData.length > 0 ? totalSales / categoryData.length : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Units per Order:</span>
                      <span className="font-medium">
                        {totalOrders > 0 ? (totalQuantity / totalOrders).toFixed(1) : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">📦 Category Performance Analysis</h3>
              <p className="text-gray-600">Performance breakdown by product category</p>
            </div>
            <div className="p-6">
              {categoryData.length > 0 ? (
                <div className="space-y-4">
                  {categoryData
                    .sort((a, b) => b.total_sales - a.total_sales)
                    .map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{category.category}</h4>
                            <p className="text-sm text-gray-500">
                              {category.total_orders} orders • {category.total_quantity} units
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(category.total_sales)}</p>
                          <p className="text-sm text-gray-500">
                            {((category.total_sales / totalSales) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No category data available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'top-products' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">🏆 Top Performing Products</h3>
              <p className="text-gray-600">Best-selling products by revenue</p>
            </div>
            <div className="p-6">
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.product_name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                          <p className="text-sm text-gray-500">
                            {product.category} • {product.total_quantity} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(product.total_sales)}</p>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No product data available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">💡 Product Insights & Recommendations</h3>
                <p className="text-gray-600">Data-driven insights for product optimization</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">🏆 Top Category</h4>
                    <p className="text-sm text-gray-600">
                      {categoryData.length > 0 ? 
                        `${categoryData.reduce((prev, current) => (prev.total_sales > current.total_sales) ? prev : current).category} drives most revenue` :
                        'No data available'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">📈 Growth Opportunity</h4>
                    <p className="text-sm text-gray-600">
                      Focus on promoting underperforming categories with high potential
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">🎯 Optimization</h4>
                    <p className="text-sm text-gray-600">
                      Increase inventory for top-performing products to maximize revenue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">💰 Revenue Distribution</h4>
                    <p className="text-sm text-gray-600">
                      {categoryData.length > 0 && 
                        `Top category contributes ${((categoryData.reduce((prev, current) => (prev.total_sales > current.total_sales) ? prev : current).total_sales / totalSales) * 100).toFixed(1)}% of total revenue`
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">📦 Inventory Insights</h4>
                    <p className="text-sm text-gray-600">
                      Monitor stock levels for high-velocity products to prevent stockouts
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">🔄 Cross-selling</h4>
                    <p className="text-sm text-gray-600">
                      Bundle complementary products from different categories to increase AOV
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}