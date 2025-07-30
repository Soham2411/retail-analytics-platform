'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CLVCustomer {
  customer_id: string;
  customer_name: string;
  segment: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  predicted_clv: number;
  monthly_frequency: number;
}

interface Props {
  data: CLVCustomer[];
}

export default function CLVDistributionChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">No CLV data available</div>;
  }

  // Create CLV distribution buckets
  const createCLVDistribution = () => {
    const buckets = [
      { range: '$0-$500', min: 0, max: 500, count: 0 },
      { range: '$500-$1K', min: 500, max: 1000, count: 0 },
      { range: '$1K-$2K', min: 1000, max: 2000, count: 0 },
      { range: '$2K-$5K', min: 2000, max: 5000, count: 0 },
      { range: '$5K-$10K', min: 5000, max: 10000, count: 0 },
      { range: '$10K+', min: 10000, max: Infinity, count: 0 }
    ];

    data.forEach(customer => {
      const clv = customer.predicted_clv;
      const bucket = buckets.find(b => clv >= b.min && clv < b.max);
      if (bucket) bucket.count++;
    });

    return buckets.filter(b => b.count > 0);
  };

  const distributionData = createCLVDistribution();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">CLV Range: {label}</p>
          <p className="text-sm text-gray-600">Customers: {value}</p>
          <p className="text-sm text-gray-600">
            {((value / data.length) * 100).toFixed(1)}% of total customers
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* CLV Distribution Histogram */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Lifetime Value Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CLV Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">CLV Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Average CLV</p>
            <p className="font-semibold text-gray-900">
              ${(data.reduce((sum, c) => sum + c.predicted_clv, 0) / data.length).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Highest CLV</p>
            <p className="font-semibold text-gray-900">
              ${Math.max(...data.map(c => c.predicted_clv)).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">High-Value (&gt;$5K)</p>
            <p className="font-semibold text-gray-900">
              {data.filter(c => c.predicted_clv > 5000).length} customers
            </p>
          </div>
          <div>
            <p className="text-gray-600">At Risk (&lt;$1K)</p>
            <p className="font-semibold text-gray-900">
              {data.filter(c => c.predicted_clv < 1000).length} customers
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Customers by CLV */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Top 5 Customers by Predicted CLV</h4>
        <div className="space-y-2">
          {data
            .sort((a, b) => b.predicted_clv - a.predicted_clv)
            .slice(0, 5)
            .map((customer, index) => (
              <div key={customer.customer_id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{customer.customer_name}</p>
                    <p className="text-xs text-gray-500">{customer.segment} • {customer.total_orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">${customer.predicted_clv.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">CLV</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}