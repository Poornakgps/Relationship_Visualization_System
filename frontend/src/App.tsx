import React, { useState } from 'react';
import { Search, Network, Users, CreditCard, AlertTriangle, Link, GitBranch, RefreshCw } from 'lucide-react';
import { useGraphData, useHealthCheck } from '@/hooks/useGraphData';
import { FilterProvider, useFilteredGraphData } from '@/hooks/useFilters';
import GraphVisualization from '@/components/GraphVisualization';
import UserList from '@/components/UserList';
import TransactionList from '@/components/TransactionList';
import UserConnections from '@/components/UserConnections';
import TransactionConnections from '@/components/TransactionConnections';
import SearchFilters from '@/components/SearchFilters';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

type ActivePanel = 'graph' | 'users' | 'transactions' | 'user-connections' | 'transaction-connections';

const AppContent: React.FC = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { graphData, isLoading, error, refetch } = useGraphData();
  const filteredGraphData = useFilteredGraphData(graphData);
  const { data: isApiHealthy } = useHealthCheck();

  // Navigation items
  const navigationItems = [
    { id: 'graph' as ActivePanel, label: 'Graph View', icon: Network },
    { id: 'users' as ActivePanel, label: 'Users', icon: Users },
    { id: 'transactions' as ActivePanel, label: 'Transactions', icon: CreditCard },
    { id: 'user-connections' as ActivePanel, label: 'User Links', icon: Link },
    { id: 'transaction-connections' as ActivePanel, label: 'Transaction Links', icon: GitBranch },
  ];

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Loading graph data..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load data
            </h3>
            <p className="text-gray-600 mb-4">
              {error.message || 'Something went wrong while loading the graph data.'}
            </p>
            <button
              onClick={refetch}
              className="btn btn-primary btn-md"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (activePanel) {
      case 'graph':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Relationship Graph
                </h2>
                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">
                  {filteredGraphData?.nodes.length || 0} nodes, {filteredGraphData?.edges.length || 0} edges
                </span>
                  <button
                    onClick={refetch}
                    className="btn btn-secondary btn-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {filteredGraphData ? (
                <GraphVisualization graphData={filteredGraphData} />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">No graph data available</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                <button
                  onClick={refetch}
                  className="btn btn-secondary btn-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <UserList searchQuery={searchQuery} />
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
                <button
                  onClick={refetch}
                  className="btn btn-secondary btn-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TransactionList searchQuery={searchQuery} />
            </div>
          </div>
        );

      case 'user-connections':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  User Connections
                </h2>
                <button
                  onClick={refetch}
                  className="btn btn-secondary btn-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Explore user-to-user and user-to-transaction relationships
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <UserConnections />
            </div>
          </div>
        );

      case 'transaction-connections':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Transaction Connections
                </h2>
                <button
                  onClick={refetch}
                  className="btn btn-secondary btn-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Discover transaction-to-transaction links through common attributes
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <TransactionConnections />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Network className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Flagright Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  User & Transaction Relationship Visualization
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* API Status Indicator */}
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    isApiHealthy ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  API {isApiHealthy ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Navigation */}
              <nav className="flex space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePanel(item.id)}
                      className={`
                        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${activePanel === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar - only show for certain panels */}
          {(activePanel === 'graph') && (
            <aside className="sidebar">
              <div className="sidebar-header">
                <h3 className="font-semibold text-gray-900">Filters & Controls</h3>
              </div>
              <div className="sidebar-content p-4">
                <SearchFilters />
              </div>
            </aside>
          )}

          {/* Main Panel */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {renderMainContent()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <FilterProvider>
      <AppContent />
    </FilterProvider>
  );
};

export default App; 