import React, { useState } from 'react';
import { Users as UsersIcon, Shield, FileText, X } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { PermissionControl } from './PermissionControl';
import { SystemLogs } from './SystemLogs';
import type { User, Permission, Log } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  currentUser: User;
}

export default function AdminPanel({ onClose, currentUser }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'logs'>('users');

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-medium">Admin Panel</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>
        
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-48 border-r bg-gray-50">
            <nav className="space-y-1 p-4">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-3 py-2 w-full rounded-md ${
                  activeTab === 'users' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UsersIcon className="h-4 w-4 mr-2" />
                <span>Users</span>
              </button>
              
              <button
                onClick={() => setActiveTab('permissions')}
                className={`flex items-center px-3 py-2 w-full rounded-md ${
                  activeTab === 'permissions' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Shield className="h-4 w-4 mr-2" />
                <span>Permissions</span>
              </button>
              
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center px-3 py-2 w-full rounded-md ${
                  activeTab === 'logs' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>System Logs</span>
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'users' && <UserManagement currentUser={currentUser} />}
            {activeTab === 'permissions' && <PermissionControl currentUser={currentUser} />}
            {activeTab === 'logs' && <SystemLogs currentUser={currentUser} />}
          </div>
        </div>
      </div>
    </div>
  );
}