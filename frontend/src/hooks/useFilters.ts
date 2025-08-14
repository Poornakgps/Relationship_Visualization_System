import React, { useState, useMemo, useCallback, createContext, useContext, ReactNode } from 'react';
import { GraphData, GraphFilters, RelationshipType, Transaction } from '@/types';
import { RELATIONSHIP_CONFIGS } from '@/utils';

// Default filter state
const defaultFilters: GraphFilters = {
  showUsers: true,
  showTransactions: true,
  relationshipTypes: Object.keys(RELATIONSHIP_CONFIGS) as RelationshipType[],
  minAmount: undefined,
  maxAmount: undefined,
};

// Filter context
interface FilterContextType {
  filters: GraphFilters;
  setFilters: React.Dispatch<React.SetStateAction<GraphFilters>>;
  resetFilters: () => void;
  applyFilters: (graphData: GraphData) => GraphData;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Filter provider component
export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GraphFilters>(defaultFilters);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const applyFilters = useCallback((graphData: GraphData): GraphData => {
    if (!graphData) return graphData;

    // Filter nodes
    let filteredNodes = graphData.nodes.filter(node => {
      // Filter by node type
      if (node.type === 'user' && !filters.showUsers) return false;
      if (node.type === 'transaction' && !filters.showTransactions) return false;

      // Filter transactions by amount
      if (node.type === 'transaction') {
        const transaction = node.data as Transaction;
        if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) return false;
        if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) return false;
      }

      return true;
    });

    // Get IDs of filtered nodes
    const nodeIds = new Set(filteredNodes.map(node => node.id));

    // Filter edges
    let filteredEdges = graphData.edges.filter(edge => {
      // Only include edges where both source and target nodes exist
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return false;

      // Filter by relationship type
      if (!filters.relationshipTypes.includes(edge.type)) return false;

      return true;
    });

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [filters]);

  const value = {
    filters,
    setFilters,
    resetFilters,
    applyFilters,
  };

  return React.createElement(FilterContext.Provider, { value }, children);
};

// Custom hook to use filters
export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;

};

// Hook for filtered graph data
export const useFilteredGraphData = (graphData: GraphData | null) => {
  const { applyFilters } = useFilters();
  
  return useMemo(() => {
    if (!graphData) return null;
    return applyFilters(graphData);
  }, [graphData, applyFilters]);
}; 