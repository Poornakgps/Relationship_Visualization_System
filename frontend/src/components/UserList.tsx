import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, UserPlus, Edit2 } from 'lucide-react';
import { useUsers } from '@/hooks/useGraphData';
import { User } from '@/types';
import { formatDate } from '@/utils';
import LoadingSpinner from './LoadingSpinner';
import UserForm from './UserForm';

interface UserListProps {
  searchQuery: string;
}

const UserList: React.FC<UserListProps> = ({ searchQuery }) => {
  const { data: users = [], isLoading, error } = useUsers();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'createdAt' as 'name' | 'email' | 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    showRecentOnly: false,
  });

  // Form state
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    }
    
    // Apply recent filter
    if (filters.showRecentOnly) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(user => new Date(user.createdAt) > weekAgo);
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [users, searchQuery, filters]);

  const handleCreateUser = () => {
    setFormMode('create');
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormMode('edit');
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsUserFormOpen(false);
    setEditingUser(null);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." className="p-8" />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading users: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            Users ({filteredUsers.length})
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateUser}
              className="btn btn-sm btn-primary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="input text-sm"
              >
                <option value="createdAt">Creation Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                className="input text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time Filter</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showRecentOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, showRecentOnly: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">Recent (7 days)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="font-mono">{user.id}</td>
              <td className="font-medium">
                {user.firstName} {user.lastName}
              </td>
              <td className="text-blue-600">{user.email}</td>
              <td className="font-mono">{user.phone}</td>
              <td className="text-gray-600 max-w-xs truncate">
                {user.address}
              </td>
              <td className="text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td>
                <button
                  onClick={() => handleEditUser(user)}
                  className="btn btn-sm btn-secondary"
                  title="Edit user"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No users found matching your search.' : 'No users available.'}
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={isUserFormOpen}
        onClose={handleCloseForm}
        user={editingUser}
        mode={formMode}
      />
    </div>
  );
};

export default UserList; 