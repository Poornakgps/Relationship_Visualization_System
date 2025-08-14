import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { 
  CreateUserRequest, 
  CreateTransactionRequest,
  GraphData 
} from '@/types';
import { buildGraphData } from '@/utils';

// Query keys
export const QUERY_KEYS = {
  users: 'users',
  transactions: 'transactions',
  userConnections: (id: number) => ['user-connections', id],
  transactionConnections: (id: number) => ['transaction-connections', id],
} as const;

// Hook for fetching all users
export const useUsers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.users],
    queryFn: () => apiService.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

// Hook for fetching all transactions
export const useTransactions = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.transactions],
    queryFn: () => apiService.getTransactions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

// Hook for fetching user by ID
export const useUser = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.users, id],
    queryFn: () => apiService.getUserById(id),
    enabled: !!id,
  });
};

// Hook for fetching transaction by ID
export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.transactions, id],
    queryFn: () => apiService.getTransactionById(id),
    enabled: !!id,
  });
};

// Hook for fetching user connections
export const useUserConnections = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.userConnections(id),
    queryFn: () => apiService.getUserConnections(id),
    enabled: !!id,
  });
};

// Hook for fetching transaction connections
export const useTransactionConnections = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.transactionConnections(id),
    queryFn: () => apiService.getTransactionConnections(id),
    enabled: !!id,
  });
};

// Hook for creating a user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserRequest) => apiService.createUser(userData),
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
};

// Hook for creating a transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (transactionData: CreateTransactionRequest) => 
      apiService.createTransaction(transactionData),
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
    },
  });
};

// Hook for updating user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: Partial<CreateUserRequest> }) =>
      apiService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
  });
};



// Hook for searching users
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.users, 'search', query],
    queryFn: () => apiService.searchUsers(query),
    enabled: !!query && query.length > 2,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for high-value transactions
export const useHighValueTransactions = (minAmount: number = 10000) => {
  return useQuery({
    queryKey: [QUERY_KEYS.transactions, 'high-value', minAmount],
    queryFn: () => apiService.getHighValueTransactions(minAmount),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Combined hook for graph data
export const useGraphData = (): {
  graphData: GraphData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useTransactions();

  const isLoading = usersLoading || transactionsLoading;
  const error = usersError || transactionsError;

  const graphData = (!isLoading && !error && users.length > 0) 
    ? buildGraphData(users, transactions)
    : null;

  const refetch = () => {
    refetchUsers();
    refetchTransactions();
  };

  return {
    graphData,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};

// Hook for API health check
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(),
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
}; 