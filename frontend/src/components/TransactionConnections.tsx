import React, { useState } from 'react';
import { Search, CreditCard, Monitor, Wifi, CreditCard as PaymentIcon, Share2 } from 'lucide-react';
import { useTransactions, useTransactionConnections } from '@/hooks/useGraphData';
import { formatCurrency, formatDate } from '@/utils';
import LoadingSpinner from './LoadingSpinner';

const TransactionConnections: React.FC = () => {
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: connections = [], isLoading: connectionsLoading } = useTransactionConnections(selectedTransactionId || 0);

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (transaction.description?.toLowerCase().includes(searchLower)) ||
      (transaction.currency?.toLowerCase().includes(searchLower)) ||
      (transaction.status?.toLowerCase().includes(searchLower)) ||
      (transaction.amount?.toString().includes(searchQuery)) ||
      (transaction.paymentMethod?.toLowerCase().includes(searchLower)) ||
      (transaction.id?.toString().includes(searchQuery))
    );
  });

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'SAME_DEVICE':
        return <Monitor className="w-4 h-4 text-pink-500" />;
      case 'SAME_IP':
        return <Wifi className="w-4 h-4 text-indigo-500" />;
      case 'SAME_PAYMENT_METHOD':
        return <PaymentIcon className="w-4 h-4 text-teal-500" />;
      default:
        return <Share2 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRelationshipBadgeClass = (type: string) => {
    switch (type) {
      case 'SAME_DEVICE':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'SAME_IP':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SAME_PAYMENT_METHOD':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'SAME_DEVICE':
        return 'Device';
      case 'SAME_IP':
        return 'IP';
      case 'SAME_PAYMENT_METHOD':
        return 'Payment';
      default:
        return type.replace('SAME_', '');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (transactionsLoading) {
    return <LoadingSpinner message="Loading transactions..." className="p-8" />;
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Transactions List */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Transactions ({transactions.length})
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => setSelectedTransactionId(transaction.id)}
              className={`p-3 cursor-pointer border-b hover:bg-blue-50 transition-colors ${
                selectedTransactionId === transaction.id ? 'bg-blue-100 border-blue-200' : 'bg-white'
              }`}
            >
              <div className="font-semibold text-green-600">
                {formatCurrency(transaction.amount, transaction.currency)}
              </div>
              <div className="text-sm text-gray-600 truncate">{transaction.description}</div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-gray-500">ID: {transaction.id}</div>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections Panel */}
      <div className="flex-1 flex flex-col">
        {selectedTransactionId ? (
          <>
            <div className="p-4 border-b bg-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-600" />
                Connections for Transaction {selectedTransactionId}
              </h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {connectionsLoading ? (
                <LoadingSpinner message="Loading connections..." />
              ) : connections.length > 0 ? (
                <div className="space-y-4">
                  {connections.map((connection, index) => {
                    if (!connection || !connection.transaction) return null;
                    
                    // Handle both new structure (relationshipTypes array) and old structure (single relationshipType)
                    const relationshipTypes = connection.relationshipTypes || [connection.relationshipType || 'UNKNOWN'];
                    const sharedValues = connection.sharedValues || { [connection.relationshipType || 'UNKNOWN']: connection.sharedValue || '' };
                    
                    return (
                      <div
                        key={connection.transaction.id || index}
                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col gap-1">
                              {relationshipTypes.map((type) => (
                                <div key={type} className="flex items-center gap-1">
                                  {getRelationshipIcon(type)}
                                </div>
                              ))}
                            </div>
                            <div>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(connection.transaction?.amount || 0, connection.transaction?.currency || 'INR')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {connection.transaction?.description || 'No description'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {connection.transaction?.id}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {getStatusBadge(connection.transaction?.status || 'UNKNOWN')}
                          </div>
                        </div>

                        {/* Relationship Tags */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {relationshipTypes.map((type) => (
                            <span
                              key={type}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRelationshipBadgeClass(type)}`}
                            >
                              {getRelationshipIcon(type)}
                              {getRelationshipLabel(type)}
                              {sharedValues[type] && (
                                <span className="ml-1 font-mono text-xs opacity-75">
                                  ({sharedValues[type].length > 15 ? `${sharedValues[type].substring(0, 15)}...` : sharedValues[type]})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-gray-500">From:</span>
                              <div className="font-medium">{connection.transaction?.sender?.firstName} {connection.transaction?.sender?.lastName}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">To:</span>
                              <div className="font-medium">{connection.transaction?.recipient?.firstName} {connection.transaction?.recipient?.lastName}</div>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-gray-500">IP:</span>
                              <div className="font-mono">{connection.transaction?.ipAddress || 'N/A'}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Device:</span>
                              <div className="font-mono">{connection.transaction?.deviceId || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-gray-500">Created:</span>
                            <span className="ml-2 text-gray-700">{formatDate(connection.transaction?.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <CreditCard className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No connections found</p>
                  <p className="text-sm">This transaction has no detected relationships</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a Transaction</h3>
              <p className="text-sm">Choose a transaction from the list to view its connections</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionConnections; 