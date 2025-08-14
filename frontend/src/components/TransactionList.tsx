import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '@/hooks/useGraphData';
import { formatCurrency, formatDate } from '@/utils';
import LoadingSpinner from './LoadingSpinner';
import TransactionForm from './TransactionForm';

interface TransactionListProps {
  searchQuery: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ searchQuery }) => {
  const { data: transactions = [], isLoading, error } = useTransactions();
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    
    return transactions.filter(transaction => 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.toString().includes(searchQuery)
    );
  }, [transactions, searchQuery]);



  if (isLoading) {
    return <LoadingSpinner message="Loading transactions..." className="p-8" />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading transactions: {error.message}</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'COMPLETED': 'badge-success',
      'PENDING': 'badge-warning',
      'FAILED': 'badge-danger',
      'CANCELLED': 'badge-secondary',
    };
    
    return (
      <span className={`badge ${statusStyles[status as keyof typeof statusStyles] || 'badge-secondary'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">
            Transactions ({filteredTransactions.length})
          </h4>
          <button
            onClick={() => setIsTransactionFormOpen(true)}
            className="btn btn-sm btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Description</th>
            <th>Payment Method</th>
            <th>Created</th>

          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="font-mono">{transaction.id}</td>
              <td className="font-semibold">
                {formatCurrency(transaction.amount, transaction.currency)}
              </td>
              <td>{getStatusBadge(transaction.status)}</td>
              <td className="max-w-xs truncate">
                {transaction.description}
              </td>
              <td className="text-gray-600">
                {transaction.paymentMethod}
              </td>
              <td className="text-gray-500">
                {formatDate(transaction.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No transactions found matching your search.' : 'No transactions available.'}
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
      />


    </div>
  );
};

export default TransactionList; 