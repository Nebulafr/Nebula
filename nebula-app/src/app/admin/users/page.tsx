
'use client';

import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="student">Students</TabsTrigger>
                <TabsTrigger value="coach">Coaches</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        placeholder="Search users..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <AddUserDialog />
            </div>
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>User List</CardTitle>
                    <CardDescription>A list of all the users in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredUsers.map((user) => (
                        <TableRow key={user.email}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="font-medium">{user.name}</span>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                            <Badge variant={
                                user.status === 'Active' ? 'secondary' : 
                                user.status === 'Suspended' ? 'destructive' : 'outline'
                            } className={user.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                                {user.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>Suspend</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddUserDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Fill in the details below to create a new user account.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" placeholder="John Doe" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" placeholder="john@example.com" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="coach">Coach</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create User</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
