'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ApiClient } from '@/lib/api';

// ✅ FIX: Define the SalesTrend interface to match your API response structure
interface SalesTrend {
  month: string;
  sales: number;
  profit?: number;
  orders?: number;
  revenue?: number;
}

export default function SalesTrendsChart() {
  const [trends, setTrends] = useState<SalesTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const data = await ApiClient.getSalesTrends();
        // ✅ Handle the API response - it might be an array directly or wrapped in an object
        const trendsData = Array.isArray(data) ? data : data.trends || data.data || [];
        setTrends(trendsData);
      } catch (err) {
        setError('Failed to load sales trends');
        console.error('Error fetching trends:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-600">⚠️ {error}</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Sales Trends Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'sales' || name === 'profit' || name === 'revenue' ? formatCurrency(value) : value,
              name === 'sales' ? 'Sales' : 
              name === 'profit' ? 'Profit' : 
              name === 'revenue' ? 'Revenue' : 'Orders'
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#2563eb" 
            strokeWidth={3}
            name="Sales"
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          />
          {trends.some(t => t.profit !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#059669" 
              strokeWidth={2}
              name="Profit"
              dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
            />
          )}
          {trends.some(t => t.revenue !== undefined) && (
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#dc2626" 
              strokeWidth={2}
              name="Revenue"
              dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}