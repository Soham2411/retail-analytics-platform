import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

interface ProfitabilityData {
  matrix_data: Array<{
    product_name: string;
    category: string;
    profit_margin: number;
    sales_volume: number;
    total_profit: number;
    quadrant: 'stars' | 'cash_cows' | 'question_marks' | 'dogs';
  }>;
  quadrants: {
    stars: number;
    cash_cows: number;
    question_marks: number;
    dogs: number;
  };
  category_performance: Array<{
    category: string;
    profit_margin: number;
    sales_volume: number;
    total_profit: number;
  }>;
  medians: {
    profit_margin: number;
    sales_volume: number;
  };
}

interface ProfitabilityMatrixChartProps {
  data: ProfitabilityData | null;
  loading?: boolean;
}

const QUADRANT_COLORS = {
  stars: '#22c55e',        // Green
  cash_cows: '#3b82f6',    // Blue
  question_marks: '#f59e0b', // Orange
  dogs: '#ef4444'          // Red
};

const QUADRANT_LABELS = {
  stars: 'Stars (High Margin + Volume)',
  cash_cows: 'Cash Cows (High Volume)',
  question_marks: 'Question Marks (High Margin)',
  dogs: 'Dogs (Low Margin + Volume)'
};

const ProfitabilityMatrixChart: React.FC<ProfitabilityMatrixChartProps> = ({ data, loading }) => {
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

  if (!data || !data.matrix_data?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No profitability matrix data available</p>
      </div>
    );
  }

  // Prepare quadrant distribution data
  const quadrantData = Object.entries(data.quadrants).map(([key, value]) => ({
    name: QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS],
    value,
    color: QUADRANT_COLORS[key as keyof typeof QUADRANT_COLORS],
    key
  })).filter(item => item.value > 0);

  // Custom tooltip for scatter chart
  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.product_name}</p>
          <p className="text-sm text-gray-600">{data.category}</p>
          <p className="text-sm">Profit Margin: {data.profit_margin.toFixed(1)}%</p>
          <p className="text-sm">Sales Volume: ${data.sales_volume.toLocaleString()}</p>
          <p className="text-sm">Total Profit: ${data.total_profit.toLocaleString()}</p>
          <p className="text-sm font-medium" style={{ color: QUADRANT_COLORS[data.quadrant as keyof typeof QUADRANT_COLORS] }}>
            {QUADRANT_LABELS[data.quadrant as keyof typeof QUADRANT_LABELS]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <h3 className="text-sm font-medium text-green-600">Stars</h3>
          <p className="text-2xl font-bold text-green-700">{data.quadrants.stars}</p>
          <p className="text-xs text-green-600">High margin & volume</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <h3 className="text-sm font-medium text-blue-600">Cash Cows</h3>
          <p className="text-2xl font-bold text-blue-700">{data.quadrants.cash_cows}</p>
          <p className="text-xs text-blue-600">High volume products</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <h3 className="text-sm font-medium text-orange-600">Question Marks</h3>
          <p className="text-2xl font-bold text-orange-700">{data.quadrants.question_marks}</p>
          <p className="text-xs text-orange-600">High margin, low volume</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <h3 className="text-sm font-medium text-red-600">Dogs</h3>
          <p className="text-2xl font-bold text-red-700">{data.quadrants.dogs}</p>
          <p className="text-xs text-red-600">Low margin & volume</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Matrix Scatter Plot */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Profitability Matrix</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="sales_volume" 
                name="Sales Volume"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <YAxis 
                type="number" 
                dataKey="profit_margin" 
                name="Profit Margin"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<ScatterTooltip />} />
              
              {/* Reference lines for median */}
              <ReferenceLine 
                x={data.medians.sales_volume} 
                stroke="#666" 
                strokeDasharray="5 5"
                label={{ value: "Median Volume", position: "insideTopRight" }}
              />
              <ReferenceLine 
                y={data.medians.profit_margin} 
                stroke="#666" 
                strokeDasharray="5 5"
                label={{ value: "Median Margin", position: "insideTopLeft" }}
              />
              
              {/* Scatter plots by quadrant */}
              {Object.entries(QUADRANT_COLORS).map(([quadrant, color]) => (
                <Scatter
                  key={quadrant}
                  name={QUADRANT_LABELS[quadrant as keyof typeof QUADRANT_LABELS]}
                  data={data.matrix_data.filter(item => item.quadrant === quadrant)}
                  fill={color}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Quadrant Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Product Distribution by Quadrant</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={quadrantData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) => `${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {quadrantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Category Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.category_performance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'profit_margin' ? `${Number(value).toFixed(1)}%` : `$${Number(value).toLocaleString()}`,
                name === 'profit_margin' ? 'Avg Profit Margin' : 
                name === 'sales_volume' ? 'Total Sales Volume' : 'Total Profit'
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="profit_margin" fill="#3b82f6" name="Avg Profit Margin (%)" />
            <Bar yAxisId="right" dataKey="total_profit" fill="#10b981" name="Total Profit ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Strategic Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h4 className="font-medium text-green-800">Stars ({data.quadrants.stars})</h4>
            </div>
            <p className="text-sm text-green-700">
              Continue investing in these high-performing products. Consider expanding marketing and inventory.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <h4 className="font-medium text-blue-800">Cash Cows ({data.quadrants.cash_cows})</h4>
            </div>
            <p className="text-sm text-blue-700">
              Focus on improving profit margins through cost optimization or premium positioning.
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <h4 className="font-medium text-orange-800">Question Marks ({data.quadrants.question_marks})</h4>
            </div>
            <p className="text-sm text-orange-700">
              Invest in marketing to increase sales volume or consider niche positioning.
            </p>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <h4 className="font-medium text-red-800">Dogs ({data.quadrants.dogs})</h4>
            </div>
            <p className="text-sm text-red-700">
              Consider discontinuing or repositioning. Focus resources on better-performing products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityMatrixChart;