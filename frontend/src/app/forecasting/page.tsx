'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Brain
} from 'lucide-react';

interface ForecastData {
  historical_data: HistoricalPoint[];
  forecast: ForecastPoint[];
  accuracy_metrics: AccuracyMetrics;
  model_info: ModelInfo;
  generated_at: string;
}

interface HistoricalPoint {
  date: string;
  actual_revenue: number;
  orders?: number;
}

interface ForecastPoint {
  date: string;
  forecasted_revenue: number;
  lower_bound: number;
  upper_bound: number;
  method: string;
}

interface AccuracyMetrics {
  mean_absolute_error: number;
  mean_absolute_percentage_error: number;
  r_squared: number;
}

interface ModelInfo {
  forecast_periods: number;
  methods_used: string[];
  data_points: number;
  forecast_period: string;
}

export default function ForecastingDashboard() {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastPeriods, setForecastPeriods] = useState('12');
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    fetchForecastData();
  }, [forecastPeriods]);

  const fetchForecastData = async () => {
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

      // Use correct API endpoint
      const response = await fetch(`http://localhost:8000/api/analytics/forecast/sales?forecast_periods=${forecastPeriods}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setForecastData(data);
        setApiAvailable(true);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      setApiAvailable(false);
      
      // Fallback to mock data if API fails
      const mockData: ForecastData = {
        historical_data: [
          { date: '2014-01', actual_revenue: 145000, orders: 380 },
          { date: '2015-01', actual_revenue: 165000, orders: 425 },
          { date: '2016-01', actual_revenue: 185000, orders: 470 },
          { date: '2017-01', actual_revenue: 205000, orders: 520 },
        ],
        forecast: Array.from({ length: parseInt(forecastPeriods) }, (_, i) => {
          const baseRevenue = 220000;
          const growth = 1.03; // 3% growth
          const revenue = baseRevenue * Math.pow(growth, i);
          const year = 2018 + Math.floor(i / 12);
          const month = (i % 12) + 1;
          
          return {
            date: `${year}-${month.toString().padStart(2, '0')}`,
            forecasted_revenue: revenue,
            lower_bound: revenue * 0.85,
            upper_bound: revenue * 1.15,
            method: 'ensemble'
          };
        }),
        accuracy_metrics: {
          mean_absolute_error: 15800,
          mean_absolute_percentage_error: 8.2,
          r_squared: 0.84
        },
        model_info: {
          forecast_periods: parseInt(forecastPeriods),
          methods_used: ['linear_trend', 'moving_average', 'exponential_smoothing'],
          data_points: 4,
          forecast_period: `2018-01 to ${2018 + Math.floor(parseInt(forecastPeriods) / 12)}-${((parseInt(forecastPeriods) % 12) || 12).toString().padStart(2, '0')}`
        },
        generated_at: new Date().toISOString()
      };
      setForecastData(mockData);
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getAccuracyColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  // Combine historical and forecast data for chart
  const combinedChartData = (() => {
    if (!forecastData || !forecastData.historical_data || !forecastData.forecast) {
      return [];
    }
    
    const historicalData = forecastData.historical_data.map(point => ({
      date: point.date,
      actual: point.actual_revenue,
      forecast: null,
      lower_bound: null,
      upper_bound: null,
      type: 'historical'
    }));
    
    const forecastPoints = forecastData.forecast.map(point => ({
      date: point.date,
      actual: null,
      forecast: point.forecasted_revenue,
      lower_bound: point.lower_bound,
      upper_bound: point.upper_bound,
      type: 'forecast'
    }));
    
    return [...historicalData, ...forecastPoints];
  })();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state if no data is available
  if (!forecastData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sales Forecasting</h1>
          <p className="text-gray-600">Failed to load forecast data. Please try again.</p>
          <Button onClick={fetchForecastData} className="mt-4">
            Retry
          </Button>
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
            <Brain className="h-8 w-8 text-indigo-600" />
            Sales Forecasting
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered sales predictions and trend analysis
            {!apiAvailable && (
              <span className="ml-2 text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                Using mock data - Backend unavailable
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={forecastPeriods} onValueChange={setForecastPeriods}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Forecast Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
              <SelectItem value="18">18 Months</SelectItem>
              <SelectItem value="24">24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchForecastData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Forecast
          </Button>
        </div>
      </div>

      {/* Model Accuracy Alert */}
      {forecastData?.accuracy_metrics && (
        <Alert className={`${forecastData.accuracy_metrics.r_squared >= 0.6 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          {forecastData.accuracy_metrics.r_squared >= 0.6 ? 
            <CheckCircle className="h-4 w-4 text-green-600" /> : 
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          }
          <AlertDescription>
            <strong>Model Accuracy: {getAccuracyLabel(forecastData.accuracy_metrics.r_squared)}</strong>
            {' '}(R² = {forecastData.accuracy_metrics.r_squared.toFixed(3)})
            {forecastData.accuracy_metrics.r_squared < 0.6 && 
              ' - Consider gathering more historical data for improved accuracy.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      {forecastData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getAccuracyColor(forecastData.accuracy_metrics.r_squared)}`}>
                {getAccuracyLabel(forecastData.accuracy_metrics.r_squared)}
              </div>
              <p className="text-xs text-muted-foreground">
                R² Score: {forecastData.accuracy_metrics.r_squared.toFixed(3)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forecastData.model_info.data_points}</div>
              <p className="text-xs text-muted-foreground">
                Historical periods used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Forecast Error</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(forecastData.accuracy_metrics.mean_absolute_percentage_error)}
              </div>
              <p className="text-xs text-muted-foreground">
                Mean absolute percentage error
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast Period</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forecastPeriods}M</div>
              <p className="text-xs text-muted-foreground">
                {forecastData.model_info.forecast_period}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive Forecast Chart */}
      {forecastData && combinedChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Revenue Forecast</CardTitle>
            <CardDescription>
              Historical performance and {forecastPeriods}-month forecast with confidence intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={combinedChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    // Handle both YYYY-MM and YYYY-MM-DD formats
                    const date = value.includes('-') ? 
                      new Date(value + (value.length === 7 ? '-01' : '')) : 
                      new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value ? formatCurrency(value) : 'N/A', 
                    name === 'actual' ? 'Actual Revenue' : 
                    name === 'forecast' ? 'Forecasted Revenue' :
                    name === 'upper_bound' ? 'Upper Bound' : 'Lower Bound'
                  ]}
                  labelFormatter={(value) => {
                    const date = value.includes('-') ? 
                      new Date(value + (value.length === 7 ? '-01' : '')) : 
                      new Date(value);
                    return `Period: ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
                  }}
                />
                <Legend />
                
                {/* Historical actual data */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Actual Revenue"
                  connectNulls={false}
                />
                
                {/* Forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#dc2626"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name="Forecasted Revenue"
                  connectNulls={false}
                />
                
                {/* Confidence interval bounds */}
                <Line
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Upper Bound (95%)"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="lower_bound"
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Lower Bound (95%)"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Model Information */}
      {forecastData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Details</CardTitle>
              <CardDescription>Forecasting methodology and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Forecasting Methods Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {forecastData.model_info.methods_used.map(method => (
                      <Badge key={method} variant="outline">
                        {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">R² Score</div>
                    <div className="text-lg font-bold text-blue-900">
                      {forecastData.accuracy_metrics.r_squared.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">MAE</div>
                    <div className="text-lg font-bold text-green-900">
                      {formatCurrency(forecastData.accuracy_metrics.mean_absolute_error)}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600">
                    <p><strong>Data Quality:</strong> {forecastData.model_info.data_points >= 12 ? 'Good' : 'Limited'}</p>
                    <p><strong>Confidence:</strong> {forecastData.accuracy_metrics.r_squared >= 0.7 ? 'High' : forecastData.accuracy_metrics.r_squared >= 0.5 ? 'Medium' : 'Low'}</p>
                    <p><strong>Generated:</strong> {new Date(forecastData.generated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forecast Summary</CardTitle>
              <CardDescription>Key predictions and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Next Month Prediction</h4>
                  <div className="text-2xl font-bold text-purple-800">
                    {formatCurrency(forecastData.forecast[0]?.forecasted_revenue || 0)}
                  </div>
                  <p className="text-sm text-purple-600">
                    Range: {formatCurrency(forecastData.forecast[0]?.lower_bound || 0)} - {formatCurrency(forecastData.forecast[0]?.upper_bound || 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Growth Trend</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Positive</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confidence Level</span>
                    <Badge variant="default">High</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Model Type</span>
                    <Badge variant="outline">Ensemble</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}