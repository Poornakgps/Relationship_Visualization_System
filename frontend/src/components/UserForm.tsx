import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Save, UserPlus } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/hooks/useGraphData';
import { User as UserType, CreateUserRequest } from '@/types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType | null; // For editing
  mode: 'create' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, user, mode }) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    dateOfBirth: '',
  });

  const [errors, setErrors] = useState<Partial<CreateUserRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Initialize form data when user prop changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        address: '',
        dateOfBirth: '',
      });
    }
    setErrors({});
  }, [mode, user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserRequest> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[^\d+]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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
      if (mode === 'create') {
        await createUserMutation.mutateAsync(formData);
      } else if (mode === 'edit' && user) {
        await updateUserMutation.mutateAsync({
          id: user.id,
          userData: formData,
        });
      }
      
      onClose();
      
      // Reset form
      setFormData({
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        address: '',
        dateOfBirth: '',
      });
    } catch (error) {
      console.error('Error submitting user form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            {mode === 'create' ? (
              <UserPlus className="w-6 h-6 text-blue-600 mr-3" />
            ) : (
              <User className="w-6 h-6 text-blue-600 mr-3" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Add New User' : 'Edit User'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="john.doe@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="input pl-10 h-20 resize-none"
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="input pl-10"
              />
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
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create User' : 'Update User'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm; 