import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ABCData {
  abc_classification: Array<{
    product_name: string;
    category: string;
    revenue: number;
    revenue_percentage: number;
    cumulative_percentage: number;
    abc_class: 'A' | 'B' | 'C';
  }>;
  pareto_data: Array<{
    product_name: string;
    revenue: number;
    cumulative_percentage: number;
  }>;
  distribution: {
    A: number;
    B: number;
    C: number;
  };
  total_revenue: number;
}

interface ABCAnalysisChartProps {
  data: ABCData | null;
  loading?: boolean;
}

const COLORS = {
  A: '#22c55e', // Green - High value
  B: '#f59e0b', // Orange - Medium value
  C: '#ef4444'  // Red - Low value
};

const ABCAnalysisChart: React.FC<ABCAnalysisChartProps> = ({ data, loading }) => {
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

  if (!data || !data.pareto_data?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No ABC analysis data available</p>
      </div>
    );
  }

  // Prepare distribution data for pie chart
  const distributionData = [
    { name: 'Class A (High Value)', value: data.distribution.A || 0, color: COLORS.A },
    { name: 'Class B (Medium Value)', value: data.distribution.B || 0, color: COLORS.B },
    { name: 'Class C (Low Value)', value: data.distribution.C || 0, color: COLORS.C }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${data.total_revenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <h3 className="text-sm font-medium text-green-600">Class A Products</h3>
          <p className="text-2xl font-bold text-green-700">
            {data.distribution.A || 0}
          </p>
          <p className="text-xs text-green-600">~80% of Revenue</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <h3 className="text-sm font-medium text-orange-600">Class B Products</h3>
          <p className="text-2xl font-bold text-orange-700">
            {data.distribution.B || 0}
          </p>
          <p className="text-xs text-orange-600">~15% of Revenue</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <h3 className="text-sm font-medium text-red-600">Class C Products</h3>
          <p className="text-2xl font-bold text-red-700">
            {data.distribution.C || 0}
          </p>
          <p className="text-xs text-red-600">~5% of Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Pareto Analysis - Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.pareto_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="product_name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${Number(value).toLocaleString()}` : `${Number(value).toFixed(1)}%`,
                  name === 'revenue' ? 'Revenue' : 'Cumulative %'
                ]}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="revenue" 
                fill="#3b82f6" 
                name="Revenue"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cumulative_percentage" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Cumulative %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ABC Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">ABC Product Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ABC Classification Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">ABC Classification Results</h3>
          <p className="text-sm text-gray-600 mt-1">
            Products ranked by revenue contribution with ABC classification
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
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue %
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cumulative %
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ABC Class
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.abc_classification.slice(0, 20).map((product, index) => (
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
                    <div className="text-sm text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {product.revenue_percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {product.cumulative_percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.abc_class === 'A' 
                        ? 'bg-green-100 text-green-800'
                        : product.abc_class === 'B'
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Class {product.abc_class}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.abc_classification.length > 20 && (
          <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
            Showing top 20 of {data.abc_classification.length} products
          </div>
        )}
      </div>
    </div>
  );
};

export default ABCAnalysisChart;