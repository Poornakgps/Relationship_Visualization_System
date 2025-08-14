import { User } from './User';
import { Transaction } from './Transaction';

export interface GraphNode {
  id: string;
  label: string;
  type: 'user' | 'transaction';
  data: User | Transaction;
  size?: number;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  label: string;
  color?: string;
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type RelationshipType = 
  | 'SENT'
  | 'RECEIVED'
  | 'SHARES_EMAIL'
  | 'SHARES_PHONE'
  | 'SHARES_ADDRESS'
  | 'SAME_DEVICE'
  | 'SAME_IP'
  | 'SAME_PAYMENT_METHOD';

export interface RelationshipConfig {
  type: RelationshipType;
  color: string;
  label: string;
  weight: number;
}

export interface GraphFilters {
  showUsers: boolean;
  showTransactions: boolean;
  relationshipTypes: RelationshipType[];
  minAmount?: number;
  maxAmount?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  userNodes: number;
  transactionNodes: number;
  relationshipCounts: Record<RelationshipType, number>;
} 