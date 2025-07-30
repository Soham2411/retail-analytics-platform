'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface RFMSegmentData {
  rfm_segment: string;
  customer_count: number;
  avg_monetary: number;
  total_monetary: number;
  avg_frequency: number;
  avg_recency: number;
}

interface Props {
  data: RFMSegmentData[];
}

const SEGMENT_COLORS: { [key: string]: string } = {
  'Champions': '#10b981',
  'Loyal Customers': '#3b82f6',
  'Potential Loyalists': '#8b5cf6',
  'New Customers': '#06b6d4',
  'Promising': '#84cc16',
  'Need Attention': '#f59e0b',
  'About to Sleep': '#f97316',
  'At Risk': '#ef4444',
  'Cannot Lose Them': '#dc2626',
  'Hibernating': '#6b7280',
  'Lost': '#374151'
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name || data.rfm_segment}</p>
        <p className="text-sm text-gray-600">Customers: {(data.value || data.customer_count)?.toLocaleString()}</p>
        {data.avg_monetary && (
          <p className="text-sm text-gray-600">Avg Value: ${data.avg_monetary.toLocaleString()}</p>
        )}
        {data.total_monetary && (
          <p className="text-sm text-gray-600">Total Revenue: ${data.total_monetary.toLocaleString()}</p>
        )}
      </div>
    );
  }
  return null;
};

export default function RFMSegmentChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">No segment data available</div>;
  }

  // Prepare data for pie chart
  const pieData = data.map(item => ({
    name: item.rfm_segment,
    value: item.customer_count,
    color: SEGMENT_COLORS[item.rfm_segment] || '#6b7280'
  }));

  // Prepare data for bar chart (top segments by revenue)
  const barData = [...data]
    .sort((a, b) => b.total_monetary - a.total_monetary)
    .slice(0, 8)
    .map(item => ({
      segment: item.rfm_segment.length > 12 ? item.rfm_segment.substring(0, 12) + '...' : item.rfm_segment,
      revenue: item.total_monetary,
      customers: item.customer_count,
      rfm_segment: item.rfm_segment
    }));

  return (
    <div className="space-y-6">
      {/* Pie Chart - Customer Count Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Distribution by Segment</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }: any) => {
                if (!name || value === undefined || value === null) return '';
                const total = pieData.reduce((sum, item) => sum + (item.value || 0), 0);
                if (total === 0) return name;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${name}: ${percentage}%`;
              }}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Revenue by Segment */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue by Customer Segment</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="segment" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}