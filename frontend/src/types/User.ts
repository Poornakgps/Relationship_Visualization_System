export interface User {
  id: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
}

export interface UserConnection {
  user: User;
  relationshipTypes: string[];
  sharedValues: { [relationshipType: string]: string };
  createdAt: string;
  connectionStrength?: number;
  
  // Backward compatibility methods
  relationshipType?: string; // For compatibility - will use first from relationshipTypes
  sharedValue?: string; // For compatibility - will use first from sharedValues
} 