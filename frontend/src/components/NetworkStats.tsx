import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Users, CreditCard, Network, TrendingUp, AlertTriangle, 
  Shield, DollarSign, MapPin, RefreshCw, Download, Target
} from 'lucide-react';
import { GraphData } from '@/types';
import { calculateGraphStats, RELATIONSHIP_CONFIGS, formatCurrency, formatDate } from '@/utils';
import { useUsers, useTransactions } from '@/hooks/useGraphData';
import SimpleChart from './SimpleChart';

interface NetworkStatsProps {
  graphData: GraphData;
}

const NetworkStats: React.FC<NetworkStatsProps> = ({ graphData }) => {
  const { data: users = [] } = useUsers();
  const { data: transactions = [] } = useTransactions();
  const [activeTab, setActiveTab] = useState<'overview' | 'fraud' | 'transactions' | 'users' | 'trends'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

  const stats = useMemo(() => calculateGraphStats(graphData), [graphData]);
  
  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const filterDate = (days: number) => {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return (dateStr: string) => new Date(dateStr) >= cutoff;
    };

    let filteredTransactions = transactions;
    if (timeFilter !== 'all') {
      const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
      filteredTransactions = transactions.filter(t => filterDate(days)(t.createdAt));
    }

    // Transaction analytics
    const totalVolume = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const avgTransactionAmount = filteredTransactions.length > 0 ? totalVolume / filteredTransactions.length : 0;
    const maxTransaction = Math.max(...filteredTransactions.map(t => t.amount), 0);
    
    // High-value transactions (>$5000)
    const highValueTransactions = filteredTransactions.filter(t => t.amount > 5000);
    
    // Status distribution
    const statusCounts = filteredTransactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Currency distribution
    const currencyCounts = filteredTransactions.reduce((acc, t) => {
      acc[t.currency] = (acc[t.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Payment method distribution
    const paymentMethodCounts = filteredTransactions.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // User analytics
    const activeUsers = users.filter(u => 
      filteredTransactions.some(t => t.sender?.id === u.id || t.recipient?.id === u.id)
    );

    // Fraud indicators
    const suspiciousPatterns = {
      duplicatePhones: users.reduce((acc, user) => {
        if (user.phone) {
          acc[user.phone] = (acc[user.phone] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      duplicateEmails: users.reduce((acc, user) => {
        if (user.email) {
          acc[user.email] = (acc[user.email] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      duplicateAddresses: users.reduce((acc, user) => {
        if (user.address) {
          acc[user.address] = (acc[user.address] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    };

    const fraudAlerts = {
      duplicatePhoneCount: Object.values(suspiciousPatterns.duplicatePhones).filter(count => count > 1).length,
      duplicateEmailCount: Object.values(suspiciousPatterns.duplicateEmails).filter(count => count > 1).length,
      duplicateAddressCount: Object.values(suspiciousPatterns.duplicateAddresses).filter(count => count > 1).length,
      highValueTransactionCount: highValueTransactions.length,
      suspiciousUserCount: Object.values(suspiciousPatterns.duplicatePhones).filter(count => count > 2).length +
                           Object.values(suspiciousPatterns.duplicateEmails).filter(count => count > 2).length +
                           Object.values(suspiciousPatterns.duplicateAddresses).filter(count => count > 2).length
    };

    return {
      totalVolume,
      avgTransactionAmount,
      maxTransaction,
      highValueTransactions,
      statusCounts,
      currencyCounts,
      paymentMethodCounts,
      activeUsers,
      suspiciousPatterns,
      fraudAlerts,
      filteredTransactions
    };
  }, [users, transactions, timeFilter]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: { value: number; isPositive: boolean };
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => (
    <div className={`card transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'fraud', label: 'Fraud Detection', icon: Shield },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
  ];

  const timeFilters = [
    { id: 'all', label: 'All Time' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Volume"
          value={formatCurrency(analytics.totalVolume, 'INR')}
          subtitle={`${analytics.filteredTransactions.length} transactions`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Average Transaction"
          value={formatCurrency(analytics.avgTransactionAmount, 'INR')}
          subtitle="Per transaction"
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={analytics.activeUsers.length}
          subtitle={`of ${users.length} total users`}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Network Density"
          value={stats.totalNodes > 1 
            ? ((stats.totalEdges / (stats.totalNodes * (stats.totalNodes - 1))) * 100).toFixed(1) + '%'
            : '0%'}
          subtitle="Connection ratio"
          icon={Network}
          color="bg-orange-500"
        />
      </div>

      {/* Fraud Alerts */}
      <div className="card border-red-200 bg-red-50">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="card-title text-red-800">Fraud Risk Indicators</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.fraudAlerts.duplicatePhoneCount}</div>
              <div className="text-sm text-red-700">Duplicate Phones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.fraudAlerts.duplicateEmailCount}</div>
              <div className="text-sm text-red-700">Duplicate Emails</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.fraudAlerts.highValueTransactionCount}</div>
              <div className="text-sm text-red-700">High Value Txns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.fraudAlerts.suspiciousUserCount}</div>
              <div className="text-sm text-red-700">Suspicious Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Transaction Status</h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{status.toLowerCase()}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Payment Methods</h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {Object.entries(analytics.paymentMethodCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([method, count]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{method.replace('_', ' ')}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Relationship Distribution</h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {Object.entries(stats.relationshipCounts)
                .filter(([,count]) => count > 0)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => {
                  const config = RELATIONSHIP_CONFIGS[type as keyof typeof RELATIONSHIP_CONFIGS];
                  return (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFraudDetection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Risk Score"
          value="Medium"
          subtitle={`${analytics.fraudAlerts.suspiciousUserCount} suspicious users`}
          icon={Shield}
          color="bg-yellow-500"
        />
        <StatCard
          title="Duplicate Contacts"
          value={analytics.fraudAlerts.duplicatePhoneCount + analytics.fraudAlerts.duplicateEmailCount}
          subtitle="Shared phone/email"
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="High Value Transactions"
          value={analytics.fraudAlerts.highValueTransactionCount}
          subtitle=">$5,000 transactions"
          icon={Target}
          color="bg-orange-500"
        />
        <StatCard
          title="Network Anomalies"
          value={analytics.fraudAlerts.duplicateAddressCount}
          subtitle="Shared addresses"
          icon={MapPin}
          color="bg-purple-500"
        />
      </div>

      {/* Detailed Fraud Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Suspicious Phone Numbers</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(analytics.suspiciousPatterns.duplicatePhones)
                .filter(([,count]) => count > 1)
                .sort(([,a], [,b]) => b - a)
                .map(([phone, count]) => (
                  <div key={phone} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="font-mono text-sm">{phone}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {count} users
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">High-Value Transactions</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.highValueTransactions
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 10)
                .map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <div>
                      <div className="font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</div>
                      <div className="text-xs text-gray-500">{transaction.description}</div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactionAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={analytics.filteredTransactions.length}
          subtitle="In selected period"
          icon={CreditCard}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Volume"
          value={formatCurrency(analytics.totalVolume, 'INR')}
          subtitle="Transaction volume"
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Average Amount"
          value={formatCurrency(analytics.avgTransactionAmount, 'INR')}
          subtitle="Per transaction"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Largest Transaction"
          value={formatCurrency(analytics.maxTransaction, 'INR')}
          subtitle="Single transaction"
          icon={Target}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Transaction Status Distribution</h3>
          </div>
          <div className="card-content">
            <SimpleChart
              type="pie"
              data={Object.entries(analytics.statusCounts).map(([status, count]) => ({
                label: status,
                value: count,
                color: status === 'COMPLETED' ? '#10B981' :
                       status === 'PENDING' ? '#F59E0B' :
                       status === 'FAILED' ? '#EF4444' : '#6B7280'
              }))}
              height={200}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Payment Methods</h3>
          </div>
          <div className="card-content">
            <SimpleChart
              type="bar"
              data={Object.entries(analytics.paymentMethodCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([method, count]) => ({
                  label: method.replace('_', ' '),
                  value: count,
                  color: `hsl(${Math.random() * 360}, 70%, 50%)`
                }))}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent High-Value Transactions</h3>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.highValueTransactions
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        <span className={`badge ${
                          transaction.status === 'COMPLETED' ? 'badge-success' :
                          transaction.status === 'PENDING' ? 'badge-warning' :
                          transaction.status === 'FAILED' ? 'badge-danger' :
                          'badge-secondary'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>{transaction.paymentMethod}</td>
                      <td>{formatDate(transaction.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle="Registered users"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={analytics.activeUsers.length}
          subtitle="With transactions"
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Duplicate Phones"
          value={analytics.fraudAlerts.duplicatePhoneCount}
          subtitle="Shared phone numbers"
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="Duplicate Emails"
          value={analytics.fraudAlerts.duplicateEmailCount}
          subtitle="Shared email addresses"
          icon={AlertTriangle}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">User Activity Distribution</h3>
          </div>
          <div className="card-content">
            <SimpleChart
              type="pie"
              data={[
                { label: 'Active', value: analytics.activeUsers.length, color: '#10B981' },
                { label: 'Inactive', value: users.length - analytics.activeUsers.length, color: '#6B7280' }
              ]}
              height={200}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Indicators</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                <span className="font-medium text-red-800">High Risk Users</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  {analytics.fraudAlerts.suspiciousUserCount}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                <span className="font-medium text-yellow-800">Shared Addresses</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                  {analytics.fraudAlerts.duplicateAddressCount}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="font-medium text-blue-800">Total Risk Score</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {analytics.fraudAlerts.suspiciousUserCount + 
                   analytics.fraudAlerts.duplicatePhoneCount + 
                   analytics.fraudAlerts.duplicateEmailCount > 10 ? 'High' : 
                   analytics.fraudAlerts.suspiciousUserCount + 
                   analytics.fraudAlerts.duplicatePhoneCount + 
                   analytics.fraudAlerts.duplicateEmailCount > 5 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Network Growth"
          value={`${stats.totalNodes}`}
          subtitle="Total nodes"
          icon={Network}
          color="bg-blue-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Relationship Density"
          value={stats.totalNodes > 1 
            ? ((stats.totalEdges / (stats.totalNodes * (stats.totalNodes - 1))) * 100).toFixed(1) + '%'
            : '0%'}
          subtitle="Connection ratio"
          icon={Target}
          color="bg-green-500"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Average Connections"
          value={stats.totalNodes > 0 ? (stats.totalEdges / stats.totalNodes).toFixed(1) : '0'}
          subtitle="Per node"
          icon={TrendingUp}
          color="bg-purple-500"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Fraud Risk Trend"
          value="Stable"
          subtitle="Risk assessment"
          icon={Shield}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Relationship Type Trends</h3>
          </div>
          <div className="card-content">
            <SimpleChart
              type="bar"
              data={Object.entries(stats.relationshipCounts)
                .filter(([,count]) => count > 0)
                .map(([type, count]) => {
                  const config = RELATIONSHIP_CONFIGS[type as keyof typeof RELATIONSHIP_CONFIGS];
                  return {
                    label: config.label,
                    value: count,
                    color: config.color
                  };
                })}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Network Health Indicators</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Network Complexity</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  stats.totalEdges > stats.totalNodes ? 'bg-red-100 text-red-800' :
                  stats.totalEdges > stats.totalNodes * 0.5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {stats.totalEdges > stats.totalNodes ? 'High' : 
                   stats.totalEdges > stats.totalNodes * 0.5 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User-Transaction Ratio</span>
                <span className="text-sm text-gray-600">
                  1:{stats.userNodes > 0 ? (stats.transactionNodes / stats.userNodes).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Most Connected Type</span>
                <span className="text-sm text-gray-600">
                  {Object.entries(stats.relationshipCounts).length > 0 
                    ? Object.entries(stats.relationshipCounts)
                        .reduce((a, b) => a[1] > b[1] ? a : b)[0]
                        .replace('_', ' ')
                    : 'None'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with tabs and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="input text-sm"
          >
            {timeFilters.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
          <button className="btn btn-sm btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="btn btn-sm btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'fraud' && renderFraudDetection()}
      {activeTab === 'transactions' && renderTransactionAnalytics()}
      {activeTab === 'users' && renderUserAnalytics()}
      {activeTab === 'trends' && renderTrendAnalysis()}
    </div>
  );
};

export default NetworkStats; 