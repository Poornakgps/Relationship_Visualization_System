import { 
  User, 
  Transaction, 
  GraphNode, 
  GraphEdge, 
  GraphData, 
  RelationshipType, 
  RelationshipConfig,
  GraphStats 
} from '@/types';

// Relationship configurations for visualization
export const RELATIONSHIP_CONFIGS: Record<RelationshipType, RelationshipConfig> = {
  SENT: {
    type: 'SENT',
    color: '#10B981', // Green
    label: 'Sent',
    weight: 3,
  },
  RECEIVED: {
    type: 'RECEIVED',
    color: '#10B981', // Green
    label: 'Received',
    weight: 3,
  },
  SHARES_EMAIL: {
    type: 'SHARES_EMAIL',
    color: '#EF4444', // Red
    label: 'Shared Email',
    weight: 2,
  },
  SHARES_PHONE: {
    type: 'SHARES_PHONE',
    color: '#F59E0B', // Orange
    label: 'Shared Phone',
    weight: 2,
  },
  SHARES_ADDRESS: {
    type: 'SHARES_ADDRESS',
    color: '#8B5CF6', // Purple
    label: 'Shared Address',
    weight: 2,
  },
  SAME_DEVICE: {
    type: 'SAME_DEVICE',
    color: '#EC4899', // Pink
    label: 'Same Device',
    weight: 3,
  },
  SAME_IP: {
    type: 'SAME_IP',
    color: '#6366F1', // Indigo
    label: 'Same IP',
    weight: 3,
  },
  SAME_PAYMENT_METHOD: {
    type: 'SAME_PAYMENT_METHOD',
    color: '#14B8A6', // Teal
    label: 'Same Payment Method',
    weight: 2,
  },
};

// Convert User to GraphNode
export const userToNode = (user: User): GraphNode => ({
  id: `user-${user.id}`,
  label: `${user.firstName} ${user.lastName}`,
  type: 'user',
  data: user,
  color: '#3B82F6', // Blue
  size: 30,
});

// Convert Transaction to GraphNode
export const transactionToNode = (transaction: Transaction): GraphNode => ({
  id: `transaction-${transaction.id}`,
  label: `$${transaction.amount} ${transaction.currency}`,
  type: 'transaction',
  data: transaction,
  color: '#10B981', // Green
  size: Math.min(50, Math.max(20, transaction.amount / 1000 + 20)), // Size based on amount
});

// Create edge between two nodes
export const createEdge = (
  sourceId: string,
  targetId: string,
  relationshipType: RelationshipType,
  id?: string
): GraphEdge => {
  const config = RELATIONSHIP_CONFIGS[relationshipType];
  return {
    id: id || `${sourceId}-${targetId}-${relationshipType}`,
    source: sourceId,
    target: targetId,
    type: relationshipType,
    label: config.label,
    color: config.color,
    weight: config.weight,
  };
};

// Transform users and transactions into graph data
export const buildGraphData = (
  users: User[],
  transactions: Transaction[]
): GraphData => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add user nodes
  users.forEach(user => {
    nodes.push(userToNode(user));
  });

  // Add transaction nodes and edges
  transactions.forEach(transaction => {
    nodes.push(transactionToNode(transaction));

    // Create edges from sender to transaction and transaction to recipient
    if (transaction.sender) {
      edges.push(createEdge(
        `user-${transaction.sender.id}`,
        `transaction-${transaction.id}`,
        'SENT'
      ));
    }

    if (transaction.recipient) {
      edges.push(createEdge(
        `transaction-${transaction.id}`,
        `user-${transaction.recipient.id}`,
        'RECEIVED'
      ));
    }
  });

  // Add relationship edges (this would be enhanced with actual relationship data)
  addRelationshipEdges(users, transactions, edges);

  return { nodes, edges };
};

// Add relationship edges based on shared attributes
const addRelationshipEdges = (
  users: User[],
  transactions: Transaction[],
  edges: GraphEdge[]
): void => {
  // User-to-user relationships
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1 = users[i];
      const user2 = users[j];

      // Shared email
      if (user1.email === user2.email && user1.email) {
        edges.push(createEdge(
          `user-${user1.id}`,
          `user-${user2.id}`,
          'SHARES_EMAIL'
        ));
      }

      // Shared phone
      if (user1.phone === user2.phone && user1.phone) {
        edges.push(createEdge(
          `user-${user1.id}`,
          `user-${user2.id}`,
          'SHARES_PHONE'
        ));
      }

      // Shared address
      if (user1.address === user2.address && user1.address) {
        edges.push(createEdge(
          `user-${user1.id}`,
          `user-${user2.id}`,
          'SHARES_ADDRESS'
        ));
      }
    }
  }

  // Transaction-to-transaction relationships
  for (let i = 0; i < transactions.length; i++) {
    for (let j = i + 1; j < transactions.length; j++) {
      const trans1 = transactions[i];
      const trans2 = transactions[j];

      // Same device
      if (trans1.deviceId === trans2.deviceId && trans1.deviceId) {
        edges.push(createEdge(
          `transaction-${trans1.id}`,
          `transaction-${trans2.id}`,
          'SAME_DEVICE'
        ));
      }

      // Same IP
      if (trans1.ipAddress === trans2.ipAddress && trans1.ipAddress) {
        edges.push(createEdge(
          `transaction-${trans1.id}`,
          `transaction-${trans2.id}`,
          'SAME_IP'
        ));
      }

      // Same payment method
      if (trans1.paymentMethod === trans2.paymentMethod && trans1.paymentMethod) {
        edges.push(createEdge(
          `transaction-${trans1.id}`,
          `transaction-${trans2.id}`,
          'SAME_PAYMENT_METHOD'
        ));
      }
    }
  }
};

// Calculate graph statistics
export const calculateGraphStats = (graphData: GraphData): GraphStats => {
  const { nodes, edges } = graphData;
  
  const userNodes = nodes.filter(node => node.type === 'user').length;
  const transactionNodes = nodes.filter(node => node.type === 'transaction').length;
  
  const relationshipCounts = {} as Record<RelationshipType, number>;
  
  // Initialize counts
  Object.keys(RELATIONSHIP_CONFIGS).forEach(type => {
    relationshipCounts[type as RelationshipType] = 0;
  });
  
  // Count relationship types
  edges.forEach(edge => {
    relationshipCounts[edge.type]++;
  });

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    userNodes,
    transactionNodes,
    relationshipCounts,
  };
};

// Format currency amount
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get node color based on type and data
export const getNodeColor = (node: GraphNode): string => {
  if (node.type === 'user') {
    return '#3B82F6'; // Blue for users
  } else {
    const transaction = node.data as Transaction;
    // Color intensity based on amount
    const amount = transaction.amount;
    if (amount > 10000) return '#DC2626'; // Red for high value
    if (amount > 5000) return '#F59E0B';  // Orange for medium value
    return '#10B981'; // Green for normal value
  }
};

// Get edge style based on relationship type
export const getEdgeStyle = (edge: GraphEdge) => {
  const config = RELATIONSHIP_CONFIGS[edge.type];
  return {
    'line-color': config.color,
    'width': config.weight,
    'opacity': 0.8,
    'curve-style': 'bezier',
  };
}; 