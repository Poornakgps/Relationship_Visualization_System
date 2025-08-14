import React, { useState } from 'react';
import { Search, Users, ArrowRight, Share2, Phone, Mail, MapPin } from 'lucide-react';
import { useUsers, useUserConnections } from '@/hooks/useGraphData';
import { formatDate } from '@/utils';
import LoadingSpinner from './LoadingSpinner';

const UserConnections: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: connections = [], isLoading: connectionsLoading } = useUserConnections(selectedUserId || 0);

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.firstName?.toLowerCase().includes(searchLower)) ||
      (user.lastName?.toLowerCase().includes(searchLower)) ||
      (user.email?.toLowerCase().includes(searchLower)) ||
      (user.phone?.toLowerCase().includes(searchLower)) ||
      (user.id?.toString().includes(searchQuery))
    );
  });

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'SHARES_EMAIL':
        return <Mail className="w-4 h-4 text-red-500" />;
      case 'SHARES_PHONE':
        return <Phone className="w-4 h-4 text-orange-500" />;
      case 'SHARES_ADDRESS':
        return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'SENT':
      case 'RECEIVED':
        return <ArrowRight className="w-4 h-4 text-green-500" />;
      default:
        return <Share2 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRelationshipBadgeClass = (type: string) => {
    switch (type) {
      case 'SHARES_EMAIL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SHARES_PHONE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SHARES_ADDRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'SHARES_EMAIL':
        return 'Email';
      case 'SHARES_PHONE':
        return 'Phone';
      case 'SHARES_ADDRESS':
        return 'Address';
      default:
        return type.replace('SHARES_', '');
    }
  };

  if (usersLoading) {
    return <LoadingSpinner message="Loading users..." className="p-8" />;
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Users List */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Users ({users.length})
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`p-3 cursor-pointer border-b hover:bg-blue-50 transition-colors ${
                selectedUserId === user.id ? 'bg-blue-100 border-blue-200' : 'bg-white'
              }`}
            >
              <div className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="text-xs text-gray-500">ID: {user.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections Panel */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b bg-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-600" />
                Connections for User {selectedUserId}
              </h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {connectionsLoading ? (
                <LoadingSpinner message="Loading connections..." />
              ) : connections.length > 0 ? (
                <div className="space-y-4">
                  {connections.map((connection, index) => {
                    if (!connection || !connection.user) return null;
                    
                    // Handle both new structure (relationshipTypes array) and old structure (single relationshipType)
                    const relationshipTypes = connection.relationshipTypes || [connection.relationshipType || 'UNKNOWN'];
                    const sharedValues = connection.sharedValues || { [connection.relationshipType || 'UNKNOWN']: connection.sharedValue || '' };
                    
                    return (
                      <div
                        key={connection.user.id || index}
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
                              <div className="font-medium text-gray-900">
                                {connection.user.firstName || 'Unknown'} {connection.user.lastName || 'User'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {connection.user.email || 'No email'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {connection.user.id}
                              </div>
                            </div>
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
                                  ({sharedValues[type].length > 20 ? `${sharedValues[type].substring(0, 20)}...` : sharedValues[type]})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-gray-500">Phone:</span>
                              <div className="font-mono">{connection.user.phone || 'N/A'}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Address:</span>
                              <div className="truncate">{connection.user.address || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-gray-500">Created:</span>
                            <span className="ml-2 text-gray-700">{formatDate(connection.user.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Users className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No connections found</p>
                  <p className="text-sm">This user has no detected relationships</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a User</h3>
              <p className="text-sm">Choose a user from the list to view their connections</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserConnections; 