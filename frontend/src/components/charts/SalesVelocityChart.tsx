import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface VelocityData {
  velocity_trends: Array<{
    product_name: string;
    category: string;
    latest_growth_rate: number;
    average_growth_rate: number;
    momentum: 'accelerating' | 'growing' | 'stable' | 'declining';
    total_sales: number;
    months_active: number;
  }>;
  momentum_classification: {
    accelerating?: number;
    growing?: number;
    stable?: number;
    declining?: number;
  };
  seasonal_patterns: Array<{
    month: number;
    total_sales: number;
  }>;
}

interface SalesVelocityChartProps {
  data: VelocityData | null;
  loading?: boolean;
}

const MOMENTUM_COLORS = {
  accelerating: '#22c55e',  // Green
  growing: '#3b82f6',       // Blue
  stable: '#f59e0b',        // Orange
  declining: '#ef4444'      // Red
};

const MOMENTUM_LABELS = {
  accelerating: 'Accelerating (>10% growth)',
  growing: 'Growing (0-10% growth)',
  stable: 'Stable (-10% to 0% growth)',
  declining: 'Declining (<-10% growth)'
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const SalesVelocityChart: React.FC<SalesVelocityChartProps> = ({ data, loading }) => {
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

  if (!data || !data.velocity_trends?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No sales velocity data available</p>
      </div>
    );
  }

  // Prepare momentum distribution data
  const momentumData = Object.entries(data.momentum_classification)
    .map(([key, value]) => ({
      name: MOMENTUM_LABELS[key as keyof typeof MOMENTUM_LABELS],
      value: value || 0,
      color: MOMENTUM_COLORS[key as keyof typeof MOMENTUM_COLORS],
      key
    }))
    .filter(item => item.value > 0);

  // Prepare top performers and worst performers
  const topPerformers = data.velocity_trends
    .filter(item => item.average_growth_rate > 0)
    .slice(0, 10);
  
  const worstPerformers = data.velocity_trends
    .filter(item => item.average_growth_rate < 0)
    .sort((a, b) => a.average_growth_rate - b.average_growth_rate)
    .slice(0, 10);

  // Prepare seasonal data
  const seasonalData = data.seasonal_patterns
    .sort((a, b) => a.month - b.month)
    .map(item => ({
      month: MONTH_NAMES[item.month - 1],
      sales: item.total_sales
    }));

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <h3 className="text-sm font-medium text-green-600">Accelerating</h3>
          <p className="text-2xl font-bold text-green-700">
            {data.momentum_classification.accelerating || 0}
          </p>
          <p className="text-xs text-green-600">Greater than 10% growth</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <h3 className="text-sm font-medium text-blue-600">Growing</h3>
          <p className="text-2xl font-bold text-blue-700">
            {data.momentum_classification.growing || 0}
          </p>
          <p className="text-xs text-blue-600">0-10% growth</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <h3 className="text-sm font-medium text-orange-600">Stable</h3>
          <p className="text-2xl font-bold text-orange-700">
            {data.momentum_classification.stable || 0}
          </p>
          <p className="text-xs text-orange-600">-10% to 0%</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <h3 className="text-sm font-medium text-red-600">Declining</h3>
          <p className="text-2xl font-bold text-red-700">
            {data.momentum_classification.declining || 0}
          </p>
          <p className="text-xs text-red-600">Less than -10% growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Momentum Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Sales Momentum Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={momentumData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) => `${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {momentumData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Seasonal Patterns */}
        {seasonalData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Seasonal Sales Patterns</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Top Growth Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPerformers} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `${value.toFixed(0)}%`} />
              <YAxis 
                type="category" 
                dataKey="product_name" 
                width={150}
                fontSize={10}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`,
                  name === 'average_growth_rate' ? 'Avg Growth Rate' : 'Latest Growth Rate'
                ]}
              />
              <Bar dataKey="average_growth_rate" fill="#22c55e" name="Avg Growth Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Worst Performers */}
      {worstPerformers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Declining Products (Need Attention)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={worstPerformers} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `${value.toFixed(0)}%`} />
              <YAxis 
                type="category" 
                dataKey="product_name" 
                width={150}
                fontSize={10}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`,
                  name === 'average_growth_rate' ? 'Avg Growth Rate' : 'Latest Growth Rate'
                ]}
              />
              <Bar dataKey="average_growth_rate" fill="#ef4444" name="Avg Growth Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Velocity Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Sales Velocity Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">
            Month-over-month growth trends and momentum classification
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Growth Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latest Growth
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sales
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Momentum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.velocity_trends.slice(0, 20).map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${
                      product.average_growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.average_growth_rate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm ${
                      product.latest_growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.latest_growth_rate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      ${product.total_sales.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.momentum === 'accelerating' 
                        ? 'bg-green-100 text-green-800'
                        : product.momentum === 'growing'
                        ? 'bg-blue-100 text-blue-800'
                        : product.momentum === 'stable'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.momentum.charAt(0).toUpperCase() + product.momentum.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.velocity_trends.length > 20 && (
          <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
            Showing top 20 of {data.velocity_trends.length} products
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesVelocityChart;