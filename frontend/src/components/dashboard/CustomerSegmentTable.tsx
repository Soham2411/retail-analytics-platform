'use client';

interface SegmentData {
  rfm_segment: string;
  customer_count: number;
  avg_monetary: number;
  total_monetary: number;
  avg_frequency: number;
  avg_recency: number;
}

interface Props {
  data: SegmentData[];
}

const getSegmentColor = (segment: string): string => {
  const colors: { [key: string]: string } = {
    'Champions': 'bg-green-100 text-green-800',
    'Loyal Customers': 'bg-blue-100 text-blue-800',
    'Potential Loyalists': 'bg-purple-100 text-purple-800',
    'New Customers': 'bg-cyan-100 text-cyan-800',
    'Promising': 'bg-lime-100 text-lime-800',
    'Need Attention': 'bg-yellow-100 text-yellow-800',
    'About to Sleep': 'bg-orange-100 text-orange-800',
    'At Risk': 'bg-red-100 text-red-800',
    'Cannot Lose Them': 'bg-pink-100 text-pink-800',
    'Hibernating': 'bg-gray-100 text-gray-800',
    'Lost': 'bg-slate-100 text-slate-800'
  };
  return colors[segment] || 'bg-gray-100 text-gray-800';
};

const getSegmentDescription = (segment: string): string => {
  const descriptions: { [key: string]: string } = {
    'Champions': 'Your best customers who buy frequently and recently with high value',
    'Loyal Customers': 'Regular customers with good purchase frequency',
    'Potential Loyalists': 'Recent customers with medium frequency, good potential',
    'New Customers': 'Very recent customers with low frequency',
    'Promising': 'Recent customers with low-medium frequency and value',
    'Need Attention': 'Above average customers who need re-engagement',
    'About to Sleep': 'Below average recency and frequency',
    'At Risk': 'Customers who haven\'t purchased recently but have value',
    'Cannot Lose Them': 'High value customers with low recent activity',
    'Hibernating': 'Low activity customers with decent historical value',
    'Lost': 'Customers with lowest recency, frequency and monetary value'
  };
  return descriptions[segment] || 'Customer segment';
};

export default function CustomerSegmentTable({ data }: Props) {
  // Sort by total monetary value descending
  const sortedData = [...data].sort((a, b) => b.total_monetary - a.total_monetary);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Segment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Customer Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Recency (Days)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((segment, index) => (
              <tr key={segment.rfm_segment} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentColor(segment.rfm_segment)}`}>
                        {segment.rfm_segment}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      {getSegmentDescription(segment.rfm_segment)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {segment.customer_count.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((segment.customer_count / sortedData.reduce((sum, s) => sum + s.customer_count, 0)) * 100).toFixed(1)}% of total
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(segment.total_monetary)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((segment.total_monetary / sortedData.reduce((sum, s) => sum + s.total_monetary, 0)) * 100).toFixed(1)}% of revenue
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(segment.avg_monetary)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatNumber(segment.avg_frequency)}
                  </div>
                  <div className="text-xs text-gray-500">orders</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatNumber(segment.avg_recency)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {segment.avg_recency <= 30 ? '🟢 Recent' : 
                     segment.avg_recency <= 90 ? '🟡 Moderate' : '🔴 Old'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Stats */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900">Total Customers:</span>
            <span className="ml-2 text-gray-600">
              {sortedData.reduce((sum, s) => sum + s.customer_count, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Total Revenue:</span>
            <span className="ml-2 text-gray-600">
              {formatCurrency(sortedData.reduce((sum, s) => sum + s.total_monetary, 0))}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">High-Value Segments:</span>
            <span className="ml-2 text-gray-600">
              Champions, Loyal Customers, Cannot Lose Them
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}