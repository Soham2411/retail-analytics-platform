'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, BarChart3, Globe, Users, DollarSign } from 'lucide-react';

interface RegionData {
  region: string;
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  avg_order_value: number;
  market_share: number;
  revenue_per_customer: number;
}

interface StateData {
  state: string;
  state_code: string;
  region: string;
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  avg_order_value: number;
  market_share: number;
}

interface TrendData {
  region: string;
  month: string;
  monthly_revenue: number;
  monthly_orders: number;
  monthly_customers: number;
  revenue_growth?: number;
  order_growth?: number;
}

export default function GeographicAnalytics() {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [summary, setSummary] = useState<any>({});
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    fetchGeographicData();
  }, []);

  const fetchGeographicData = async () => {
    setLoading(true);
    try {
      // Check if backend is available first
      const healthCheck = await fetch('http://localhost:8000/health', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!healthCheck.ok) {
        throw new Error('Backend not available');
      }

      // Try real API endpoints with correct URLs
      const regionResponse = await fetch('http://localhost:8000/api/analytics/geographic/regions', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (regionResponse.ok) {
        const regionResult = await regionResponse.json();
        setRegionData(regionResult.regions || []);
        setSummary(regionResult.summary || {});
        setApiAvailable(true);
      } else {
        throw new Error(`API error: ${regionResponse.status}`);
      }

      // Fetch states data
      try {
        const stateResponse = await fetch('http://localhost:8000/api/analytics/geographic/states', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (stateResponse.ok) {
          const stateResult = await stateResponse.json();
          setStateData(stateResult.states || []);
        }
      } catch (stateError) {
        console.warn('States data not available:', stateError);
      }

      // Fetch trends data
      try {
        const trendResponse = await fetch('http://localhost:8000/api/analytics/geographic/trends', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (trendResponse.ok) {
          const trendResult = await trendResponse.json();
          setTrendData(trendResult.trends || []);
        }
      } catch (trendError) {
        console.warn('Trends data not available:', trendError);
      }

    } catch (error) {
      console.warn('API not available, using mock data:', error);
      setApiAvailable(false);
      
      // Fallback to mock data if API fails
      const mockRegionData: RegionData[] = [
        {
          region: 'North',
          total_revenue: 850000,
          total_orders: 1200,
          unique_customers: 450,
          avg_order_value: 708,
          market_share: 35.2,
          revenue_per_customer: 1889
        },
        {
          region: 'South',
          total_revenue: 720000,
          total_orders: 980,
          unique_customers: 380,
          avg_order_value: 735,
          market_share: 29.8,
          revenue_per_customer: 1895
        },
        {
          region: 'East',
          total_revenue: 520000,
          total_orders: 750,
          unique_customers: 290,
          avg_order_value: 693,
          market_share: 21.5,
          revenue_per_customer: 1793
        },
        {
          region: 'West',
          total_revenue: 330000,
          total_orders: 480,
          unique_customers: 200,
          avg_order_value: 688,
          market_share: 13.5,
          revenue_per_customer: 1650
        }
      ];
      
      setRegionData(mockRegionData);
      setStateData([]); // Empty for now
      setTrendData([]); // Empty for now
      setSummary({
        total_regions: 4,
        total_revenue: 2420000,
        total_orders: 3410,
        total_customers: 1320,
        top_region: {
          name: 'North',
          revenue: 850000,
          market_share: 35.2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            Geographic Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Sales performance across regions
            {!apiAvailable && (
              <span className="ml-2 text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                Using mock data - Backend unavailable
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="aov">Avg Order Value</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regionData.map(region => (
                <SelectItem key={region.region} value={region.region}>
                  {region.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchGeographicData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionData.length}</div>
            <p className="text-xs text-muted-foreground">Active markets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(regionData.reduce((sum, r) => sum + r.total_revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Across all regions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Region</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {regionData.length > 0 ? regionData[0].region : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {regionData.length > 0 ? `${regionData[0].market_share}% market share` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(regionData.reduce((sum, r) => sum + r.unique_customers, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Metrics</CardTitle>
          <CardDescription>Detailed breakdown of performance by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Region</th>
                  <th className="text-right p-2 font-semibold">Revenue</th>
                  <th className="text-right p-2 font-semibold">Orders</th>
                  <th className="text-right p-2 font-semibold">Customers</th>
                  <th className="text-right p-2 font-semibold">AOV</th>
                  <th className="text-right p-2 font-semibold">Market Share</th>
                </tr>
              </thead>
              <tbody>
                {regionData.map((region, index) => (
                  <tr key={region.region} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2 font-medium">{region.region}</td>
                    <td className="p-2 text-right">{formatCurrency(region.total_revenue)}</td>
                    <td className="p-2 text-right">{formatNumber(region.total_orders)}</td>
                    <td className="p-2 text-right">{formatNumber(region.unique_customers)}</td>
                    <td className="p-2 text-right">{formatCurrency(region.avg_order_value)}</td>
                    <td className="p-2 text-right">{region.market_share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}