export interface Transaction {
  id: number;
  amount: number;
  currency: string;
  description: string;
  ipAddress: string;
  deviceId: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  sender: {
    id: number;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    dateOfBirth: string;
    createdAt: string;
    updatedAt: string;
  };
  recipient: {
    id: number;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    dateOfBirth: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateTransactionRequest {
  senderId: number;
  recipientId: number;
  amount: number;
  currency: string;
  description: string;
  ipAddress: string;
  deviceId: string;

  paymentMethod: string;
}

export interface TransactionConnection {
  transaction: Transaction;
  relationshipTypes: string[];
  sharedValues: { [relationshipType: string]: string };
  createdAt: string;
  connectionStrength?: number;
  
  // Backward compatibility methods
  relationshipType?: string; // For compatibility - will use first from relationshipTypes
  sharedValue?: string; // For compatibility - will use first from sharedValues
} 