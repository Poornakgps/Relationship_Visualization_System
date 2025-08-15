import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, User, Users, Smartphone, Globe, FileText, Save, Edit } from 'lucide-react';
import { useCreateTransaction, useUsers } from '@/hooks/useGraphData';
import { CreateTransactionRequest, Transaction } from '@/types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const PAYMENT_METHODS = ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'cash'];

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, editingTransaction }) => {
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    senderId: 0,
    recipientId: 0,
    amount: 0,
    currency: 'INR',
    description: '',
    ipAddress: '',
    deviceId: '',
    paymentMethod: 'credit_card',
  });

  const [errors, setErrors] = useState<Partial<CreateTransactionRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTransactionMutation = useCreateTransaction();
  const { data: users = [] } = useUsers();

  const isEditing = !!editingTransaction;

  // Reset form when modal opens or editingTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        // Pre-fill form with existing transaction data
        setFormData({
          senderId: editingTransaction.sender.id,
          recipientId: editingTransaction.recipient.id,
          amount: editingTransaction.amount,
          currency: editingTransaction.currency,
          description: editingTransaction.description,
          ipAddress: editingTransaction.ipAddress || '',
          deviceId: editingTransaction.deviceId || '',
          paymentMethod: editingTransaction.paymentMethod,
        });
      } else {
        // Reset form for new transaction
        setFormData({
          senderId: 0,
          recipientId: 0,
          amount: 0,
          currency: 'INR',
          description: '',
          ipAddress: '',
          deviceId: '',
          paymentMethod: 'credit_card',
        });
      }
      setErrors({});
    }
  }, [isOpen, editingTransaction]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.senderId || formData.senderId === 0) {
      newErrors.senderId = 'Sender is required';
    }

    if (!formData.recipientId || formData.recipientId === 0) {
      newErrors.recipientId = 'Recipient is required';
    }

    if (formData.senderId === formData.recipientId && formData.senderId !== 0) {
      newErrors.recipientId = 'Sender and recipient cannot be the same';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.paymentMethod?.trim()) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // For editing, we'll just show a success message since full transaction editing
        // might not be allowed in a real banking system for security reasons
        // You could implement status updates or other limited edits here
        console.log('Transaction edit submitted:', formData);
        alert('Transaction edit functionality would be implemented here. For security reasons, most transaction fields cannot be modified after creation.');
      } else {
        await createTransactionMutation.mutateAsync(formData);
      }
      
      onClose();
      
      // Reset form
      setFormData({
        senderId: 0,
        recipientId: 0,
        amount: 0,
        currency: 'INR',
        description: '',
        ipAddress: '',
        deviceId: '',
        paymentMethod: 'credit_card',
      });
    } catch (error) {
      console.error('Error processing transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateTransactionRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            {isEditing ? (
              <Edit className="w-6 h-6 text-blue-600 mr-3" />
            ) : (
              <CreditCard className="w-6 h-6 text-green-600 mr-3" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Transaction' : 'Create New Transaction'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-88px)] overflow-y-auto">
          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> In a real banking system, most transaction fields cannot be modified after creation for security and compliance reasons. This form shows what the interface might look like.
              </p>
            </div>
          )}

          {/* Sender and Recipient */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="senderId" className="block text-sm font-medium text-gray-700 mb-1">
                Sender *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  id="senderId"
                  value={formData.senderId}
                  onChange={(e) => handleInputChange('senderId', parseInt(e.target.value))}
                  className={`input pl-10 ${errors.senderId ? 'border-red-500' : ''} ${isEditing ? 'bg-gray-100' : ''}`}
                  disabled={isEditing}
                >
                  <option value={0}>Select sender...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              {errors.senderId && (
                <p className="text-red-500 text-xs mt-1">{errors.senderId}</p>
              )}
            </div>

            <div>
              <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  id="recipientId"
                  value={formData.recipientId}
                  onChange={(e) => handleInputChange('recipientId', parseInt(e.target.value))}
                  className={`input pl-10 ${errors.recipientId ? 'border-red-500' : ''} ${isEditing ? 'bg-gray-100' : ''}`}
                  disabled={isEditing}
                >
                  <option value={0}>Select recipient...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              {errors.recipientId && (
                <p className="text-red-500 text-xs mt-1">{errors.recipientId}</p>
              )}
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={`input pl-10 ${errors.amount ? 'border-red-500' : ''} ${isEditing ? 'bg-gray-100' : ''}`}
                  placeholder="100.00"
                  disabled={isEditing}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className={`input ${isEditing ? 'bg-gray-100' : ''}`}
                disabled={isEditing}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`input pl-10 h-20 resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Payment for services, Transfer to savings, etc."
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="input pl-10"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
                IP Address
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="ipAddress"
                  value={formData.ipAddress}
                  onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  className="input pl-10"
                  placeholder="192.168.1.1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="deviceId"
                  value={formData.deviceId}
                  onChange={(e) => handleInputChange('deviceId', e.target.value)}
                  className="input pl-10"
                  placeholder="device_001"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Transaction' : 'Create Transaction'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm; 