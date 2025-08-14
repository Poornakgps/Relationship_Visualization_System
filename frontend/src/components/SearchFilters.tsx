import React from 'react';
import { Filter, Download } from 'lucide-react';
import { RELATIONSHIP_CONFIGS } from '@/utils';
import { RelationshipType } from '@/types';
import { downloadAsJson } from '@/utils';
import { useGraphData } from '@/hooks/useGraphData';
import { useFilters } from '@/hooks/useFilters';

const SearchFilters: React.FC = () => {
  const { graphData } = useGraphData();
  const { filters, setFilters, resetFilters } = useFilters();

  const handleRelationshipToggle = (type: RelationshipType) => {
    setFilters(prev => ({
      ...prev,
      relationshipTypes: prev.relationshipTypes.includes(type)
        ? prev.relationshipTypes.filter(t => t !== type)
        : [...prev.relationshipTypes, type]
    }));
  };

  const exportData = () => {
    if (graphData) {
      downloadAsJson(graphData, `flagright-graph-${new Date().toISOString().split('T')[0]}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Node Type Filters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Node Types
        </h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showUsers}
              onChange={(e) => setFilters(prev => ({ ...prev, showUsers: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Users</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showTransactions}
              onChange={(e) => setFilters(prev => ({ ...prev, showTransactions: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Transactions</span>
          </label>
        </div>
      </div>

      {/* Relationship Type Filters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Relationship Types
        </h4>
        <div className="space-y-2">
          {Object.entries(RELATIONSHIP_CONFIGS).map(([type, config]) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.relationshipTypes.includes(type as RelationshipType)}
                onChange={() => handleRelationshipToggle(type as RelationshipType)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-2 flex items-center gap-2">
                <div 
                  className="w-3 h-1 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm text-gray-700">{config.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Amount Range Filters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Transaction Amount Range
        </h4>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min Amount</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minAmount || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value ? Number(e.target.value) : undefined }))}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Amount</label>
            <input
              type="number"
              placeholder="∞"
              value={filters.maxAmount || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value ? Number(e.target.value) : undefined }))}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t">
        <div className="space-y-2">
          <button
            onClick={resetFilters}
            className="btn btn-secondary btn-sm w-full"
          >
            Reset Filters
          </button>
          
          <button
            onClick={exportData}
            disabled={!graphData}
            className="btn btn-primary btn-sm w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Graph Stats */}
      {graphData && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Current Graph
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Nodes: {graphData.nodes.length}</div>
            <div>Edges: {graphData.edges.length}</div>
            <div>Users: {graphData.nodes.filter(n => n.type === 'user').length}</div>
            <div>Transactions: {graphData.nodes.filter(n => n.type === 'transaction').length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters; 