
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { UserFilters } from './components/user-filters';
import { UsersTable } from './components/users-table';
import { AddUserDialog } from './components/add-user-dialog';

const users = [
  {
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    avatar: 'https://i.pravatar.cc/40?u=alex',
    role: 'Student',
    status: 'Active',
    joined: '2024-07-15',
  },
  {
    name: 'Adrian Cucurella',
    email: 'adrian.cucurella@example.com',
    avatar: 'https://i.pravatar.cc/40?u=adrian-cucurella',
    role: 'Coach',
    status: 'Active',
    joined: '2024-06-20',
  },
  {
    name: 'Sarah K.',
    email: 'sarah.k@example.com',
    avatar: 'https://i.pravatar.cc/40?u=sarah',
    role: 'Student',
    status: 'Suspended',
    joined: '2024-05-10',
  },
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/40?u=john-doe',
    role: 'Admin',
    status: 'Active',
    joined: '2024-01-01',
  },
   {
    name: 'Michael B. Jordan',
    email: 'michael.jordan@example.com',
    avatar: 'https://i.pravatar.cc/40?u=michael-b-jordan',
    role: 'Coach',
    status: 'Active',
    joined: '2024-07-01',
  },
  {
    name: 'Jessica L.',
    email: 'jessica.l@example.com',
    avatar: 'https://i.pravatar.cc/40?u=jessica',
    role: 'Student',
    status: 'Active',
    joined: '2024-07-22',
  },
];

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredUsers = users.filter(user => {
    const roleMatch = activeTab === 'all' || user.role.toLowerCase() === activeTab;
    const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  const handleAddUser = (userData: any) => {
    console.log('Adding new user:', userData);
    // TODO: Implement user creation logic
  };

  const handleUserAction = (user: any, action: string) => {
    console.log(`User ${action}:`, user);
    // TODO: Implement user action logic
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="flex justify-end mb-4">
          <AddUserDialog onAddUser={handleAddUser} />
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
          <UsersTable
            users={filteredUsers}
            onUserAction={handleUserAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
