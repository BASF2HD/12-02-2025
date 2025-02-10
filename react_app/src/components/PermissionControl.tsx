import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Permission } from '../types';

interface PermissionControlProps {
  currentUser: User;
}

export function PermissionControl({ currentUser }: PermissionControlProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const availablePermissions: Permission[] = [
    'manage_users',
    'view_users',
    'manage_samples',
    'view_samples',
    'manage_permissions',
    'view_logs'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    }
  }

  async function fetchUserPermissions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId);

      if (error) throw error;
      setPermissions(data?.map(p => p.permission) || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert('Failed to fetch permissions');
    }
  }

  async function handlePermissionChange(permission: Permission, checked: boolean) {
    if (!selectedUser) return;

    try {
      if (checked) {
        const { error } = await supabase
          .from('user_permissions')
          .insert({ user_id: selectedUser, permission });

        if (error) throw error;
        setPermissions([...permissions, permission]);
      } else {
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', selectedUser)
          .eq('permission', permission);

        if (error) throw error;
        setPermissions(permissions.filter(p => p !== permission));
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      alert('Failed to update permission');
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Permission Control</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Select User
        </label>
        <select
          value={selectedUser}
          onChange={e => {
            setSelectedUser(e.target.value);
            fetchUserPermissions(e.target.value);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.fullName} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Permissions</h4>
          <div className="space-y-3">
            {availablePermissions.map(permission => (
              <div key={permission} className="flex items-center">
                <input
                  type="checkbox"
                  id={permission}
                  checked={permissions.includes(permission)}
                  onChange={e => handlePermissionChange(permission, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={permission} className="ml-2 text-sm text-gray-700">
                  {permission.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}