import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CrossSellingData {
  product_pairs: Array<{
    product_1: string;
    product_2: string;
    category_1: string;
    category_2: string;
    frequency: number;
  }>;
  category_affinity: Array<{
    category_1: string;
    category_2: string;
    frequency: number;
  }>;
  total_multi_product_orders: number;
}

interface CrossSellingChartProps {
  data: CrossSellingData | null;
  loading?: boolean;
}

const CrossSellingChart: React.FC<CrossSellingChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || (!data.product_pairs?.length && !data.category_affinity?.length)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No cross-selling data available</p>
        <p className="text-sm text-gray-400 mt-2">
          This analysis requires orders with multiple products
        </p>
      </div>
    );
  }

  // Prepare product pairs for visualization
  const topProductPairs = data.product_pairs.slice(0, 15).map(pair => ({
    name: `${pair.product_1} + ${pair.product_2}`,
    product_1: pair.product_1,
    product_2: pair.product_2,
    frequency: pair.frequency,
    displayName: `${pair.product_1.substring(0, 20)}${pair.product_1.length > 20 ? '...' : ''} + ${pair.product_2.substring(0, 20)}${pair.product_2.length > 20 ? '...' : ''}`
  }));

  // Prepare category affinity data
  const categoryAffinityData = data.category_affinity.slice(0, 10).map(affinity => ({
    name: `${affinity.category_1} → ${affinity.category_2}`,
    category_1: affinity.category_1,
    category_2: affinity.category_2,
    frequency: affinity.frequency
  }));

  // Create treemap data for visualization
  const treemapData = data.product_pairs.slice(0, 20).map((pair, index) => ({
    name: `${pair.product_1} + ${pair.product_2}`,
    size: pair.frequency,
    fill: `hsl(${(index * 137.508) % 360}, 70%, 60%)`
  }));

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Cross-selling Overview</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {data.total_multi_product_orders.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Multi-product orders analyzed</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.product_pairs.length}
              </p>
              <p className="text-sm text-gray-600">Product combinations found</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {data.category_affinity.length}
              </p>
              <p className="text-sm text-gray-600">Category combinations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Product Pairs */}
      {topProductPairs.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Most Frequently Bought Together</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topProductPairs} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="displayName" 
                width={200}
                fontSize={10}
              />
              <Tooltip 
                formatter={(value) => [`${value} times`, 'Frequency']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.product_1} + ${data.product_2}`;
                  }
                  return label;
                }}
              />
              <Bar dataKey="frequency" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Affinity */}
      {categoryAffinityData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Category Cross-selling Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryAffinityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} combinations`, 'Frequency']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.category_1} often bought with ${data.category_2}`;
                  }
                  return label;
                }}
              />
              <Bar dataKey="frequency" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Product Pairs Table */}
      {data.product_pairs.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Product Combination Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">
              Products frequently purchased together in the same order
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product 2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.product_pairs.slice(0, 20).map((pair, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pair.product_1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pair.product_2}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {pair.category_1} + {pair.category_2}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-blue-600">
                        {pair.frequency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pair.frequency >= 5 
                          ? 'bg-green-100 text-green-800'
                          : pair.frequency >= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pair.frequency >= 5 
                          ? 'Strong Bundle' 
                          : pair.frequency >= 3 
                          ? 'Consider Bundle' 
                          : 'Weak Pattern'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.product_pairs.length > 20 && (
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
              Showing top 20 of {data.product_pairs.length} product combinations
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Cross-selling Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Bundle Opportunities</h4>
            <p className="text-sm text-blue-700">
              Create product bundles for frequently bought combinations with 5+ occurrences.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Recommendation Engine</h4>
            <p className="text-sm text-green-700">
              Use these patterns to recommend complementary products during checkout.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Category Strategy</h4>
            <p className="text-sm text-purple-700">
              Focus cross-category promotions on high-affinity category pairs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossSellingChart;