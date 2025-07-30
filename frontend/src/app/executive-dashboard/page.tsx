'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Target,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Download,
  Mail,
  Calendar
} from 'lucide-react';

// Import types from API client
interface ExecutiveSummary {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  executive_summary: string;
  key_insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  performance_metrics: {
    total_revenue: number;
    total_orders: number;
    unique_customers: number;
    avg_order_value: number;
    regional_breakdown: Array<{
      region: string;
      revenue: number;
    }>;
    category_breakdown: Array<{
      category: string;
      revenue: number;
      units: number;
    }>;
  };
  growth_metrics: {
    total_revenue: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
    total_orders: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
    unique_customers: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
    avg_order_value: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    actions: string[];
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    type: string;
    title: string;
    message: string;
    action_required: boolean;
  }>;
  generated_at: string;
}

export default function ExecutiveDashboard() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    fetchExecutiveSummary();
  }, []);

  const fetchExecutiveSummary = async () => {
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
      const response = await fetch('http://localhost:8000/api/analytics/executive-summary', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        setApiAvailable(true);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      setApiAvailable(false);
      
      // Fallback to complete mock data if API fails
      const mockSummary: ExecutiveSummary = {
        period: {
          start_date: '2014-01-01',
          end_date: '2017-12-31',
          days: 1460
        },
        executive_summary: `Business performance analysis based on historical data from 2014-2017 shows strong retail growth patterns with revenue trends indicating seasonal variations and customer behavior insights. The analysis reveals consistent growth across all key metrics with particular strength in customer acquisition and retention strategies.`,
        key_insights: [
          {
            type: 'positive',
            title: 'Strong Historical Performance',
            description: 'Data from 2014-2017 shows consistent growth patterns across all regions with total revenue reaching $2.34M.',
            impact: 'high'
          },
          {
            type: 'positive',
            title: 'Customer Base Expansion',
            description: 'Customer acquisition rates remained strong throughout the analysis period with 18.2% growth.',
            impact: 'medium'
          },
          {
            type: 'neutral',
            title: 'Seasonal Patterns Identified',
            description: 'Clear seasonal trends visible in the historical data for improved planning and forecasting.',
            impact: 'medium'
          }
        ],
        performance_metrics: {
          total_revenue: 2340000,
          total_orders: 14250,
          unique_customers: 4680,
          avg_order_value: 164,
          regional_breakdown: [
            { region: 'North', revenue: 850000 },
            { region: 'South', revenue: 720000 },
            { region: 'East', revenue: 520000 },
            { region: 'West', revenue: 250000 }
          ],
          category_breakdown: [
            { category: 'Electronics', revenue: 980000, units: 3200 },
            { category: 'Clothing', revenue: 720000, units: 5800 },
            { category: 'Home & Garden', revenue: 420000, units: 2100 },
            { category: 'Sports', revenue: 220000, units: 1350 }
          ]
        },
        growth_metrics: {
          total_revenue: {
            current: 2340000,
            previous: 1896000,
            growth_rate: 23.5,
            growth_direction: 'up'
          },
          total_orders: {
            current: 14250,
            previous: 12100,
            growth_rate: 17.8,
            growth_direction: 'up'
          },
          unique_customers: {
            current: 4680,
            previous: 3960,
            growth_rate: 18.2,
            growth_direction: 'up'
          },
          avg_order_value: {
            current: 164,
            previous: 157,
            growth_rate: 4.5,
            growth_direction: 'up'
          }
        },
        recommendations: [
          {
            priority: 'high',
            category: 'Regional Expansion',
            title: 'Focus on West Region Growth',
            description: 'West region shows significant potential for expansion based on historical performance patterns.',
            actions: [
              'Analyze successful strategies from North region',
              'Increase marketing presence in West region',
              'Consider regional product preferences and demographics'
            ]
          },
          {
            priority: 'medium',
            category: 'Customer Development',
            title: 'Enhance Customer Retention Programs',
            description: 'Build on strong customer acquisition with comprehensive retention and loyalty initiatives.',
            actions: [
              'Implement tiered loyalty program with exclusive benefits',
              'Develop personalized product recommendation engine',
              'Create customer feedback and satisfaction systems'
            ]
          },
          {
            priority: 'medium',
            category: 'Product Strategy',
            title: 'Optimize Category Performance',
            description: 'Leverage Electronics success to boost underperforming categories like Sports.',
            actions: [
              'Cross-promote high-performing products',
              'Review pricing strategy for underperforming categories',
              'Enhance product discovery and recommendations'
            ]
          }
        ],
        alerts: [
          {
            severity: 'info',
            type: 'analysis',
            title: 'Historical Data Analysis Complete',
            message: 'Comprehensive analysis of 2014-2017 data shows strong performance trends with actionable insights.',
            action_required: false
          },
          {
            severity: 'info',
            type: 'opportunity',
            title: 'Regional Growth Opportunity',
            message: 'West region shows significant untapped potential based on demographic and market analysis.',
            action_required: false
          }
        ],
        generated_at: new Date().toISOString()
      };
      setSummary(mockSummary);
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

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getGrowthColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'negative': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Executive Dashboard</h1>
          <p className="text-gray-600">Failed to load executive summary. Please try again.</p>
          <Button onClick={fetchExecutiveSummary} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-8 w-8 text-purple-600" />
              Executive Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Business intelligence and automated insights for {summary.period.start_date} to {summary.period.end_date}
              {!apiAvailable && (
                <span className="ml-2 text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                  Using mock data - Backend unavailable
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={fetchExecutiveSummary} size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.performance_metrics.total_revenue)}
              </div>
              <div className={`flex items-center text-xs ${getGrowthColor(summary.growth_metrics.total_revenue.growth_direction)}`}>
                {getGrowthIcon(summary.growth_metrics.total_revenue.growth_direction)}
                <span className="ml-1">
                  {formatPercentage(summary.growth_metrics.total_revenue.growth_rate)} from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(summary.performance_metrics.total_orders)}
              </div>
              <div className={`flex items-center text-xs ${getGrowthColor(summary.growth_metrics.total_orders.growth_direction)}`}>
                {getGrowthIcon(summary.growth_metrics.total_orders.growth_direction)}
                <span className="ml-1">
                  {formatPercentage(summary.growth_metrics.total_orders.growth_rate)} from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unique Customers</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(summary.performance_metrics.unique_customers)}
              </div>
              <div className={`flex items-center text-xs ${getGrowthColor(summary.growth_metrics.unique_customers.growth_direction)}`}>
                {getGrowthIcon(summary.growth_metrics.unique_customers.growth_direction)}
                <span className="ml-1">
                  {formatPercentage(summary.growth_metrics.unique_customers.growth_rate)} from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.performance_metrics.avg_order_value)}
              </div>
              <div className={`flex items-center text-xs ${getGrowthColor(summary.growth_metrics.avg_order_value.growth_direction)}`}>
                {getGrowthIcon(summary.growth_metrics.avg_order_value.growth_direction)}
                <span className="ml-1">
                  {formatPercentage(summary.growth_metrics.avg_order_value.growth_rate)} from last period
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Executive Summary</CardTitle>
            <CardDescription className="text-gray-600">AI-generated business insights and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {summary.executive_summary}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Key Business Insights</CardTitle>
              <CardDescription className="text-gray-600">Data-driven insights from your business performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                          {insight.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Strategic Recommendations</CardTitle>
              <CardDescription className="text-gray-600">Actionable recommendations to improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityBadge(rec.priority)}
                      <Badge variant="outline">{rec.category}</Badge>
                    </div>
                    <h4 className="font-semibold mb-1 text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">Action Items:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {rec.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-1">
                            <span className="text-gray-400">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional and Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Regional Performance</CardTitle>
              <CardDescription className="text-gray-600">Revenue breakdown by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.performance_metrics.regional_breakdown.map((region, index) => {
                  const total = summary.performance_metrics.regional_breakdown.reduce((sum, r) => sum + r.revenue, 0);
                  const percentage = (region.revenue / total) * 100;
                  
                  return (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{region.region}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(region.revenue)}</div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Category Performance</CardTitle>
              <CardDescription className="text-gray-600">Revenue and units by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 font-semibold text-gray-900">Category</th>
                      <th className="text-right p-2 font-semibold text-gray-900">Revenue</th>
                      <th className="text-right p-2 font-semibold text-gray-900">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.performance_metrics.category_breakdown.map((category, index) => (
                      <tr key={category.category} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-2 font-medium text-gray-900">{category.category}</td>
                        <td className="p-2 text-right text-gray-900">{formatCurrency(category.revenue)}</td>
                        <td className="p-2 text-right text-gray-600">{formatNumber(category.units)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}