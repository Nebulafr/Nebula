
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { MoreHorizontal, DollarSign, Users, UserPlus, Briefcase } from 'lucide-react';
import Link from 'next/link';

const recentSignups = [
  {
    name: 'Jessica L.',
    email: 'jessica.l@example.com',
    avatar: 'https://i.pravatar.cc/40?u=jessica',
    role: 'Student',
  },
  {
    name: 'Michael B. Jordan',
    email: 'michael.jordan@example.com',
    avatar: 'https://i.pravatar.cc/40?u=michael-b-jordan',
    role: 'Coach',
  },
  {
    name: 'Emily R.',
    email: 'emily.r@example.com',
    avatar: 'https://i.pravatar.cc/40?u=emily',
    role: 'Student',
  }
];

const platformActivity = [
    {
        type: 'New Coach',
        description: 'Adrian Cucurella has been approved as a new coach.',
        time: '5m ago'
    },
    {
        type: 'New Program',
        description: 'A new program "Advanced System Design" was created.',
        time: '1h ago'
    },
     {
        type: 'New Student',
        description: 'Jessica L. signed up as a new student.',
        time: '2h ago'
    },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h3 className="text-3xl font-bold tracking-tight">Dashboard</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$231,231.89</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,231</div>
            <p className="text-xs text-muted-foreground">+120 from last month</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sign-ups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+30.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Sign-ups</CardTitle>
             <CardDescription>A list of the newest users on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSignups.map((user, index) => (
                  <TableRow key={index}>
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
                    <TableCell>
                        <Badge variant={user.role === 'Coach' ? 'secondary' : 'outline'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <Button asChild className="mt-6 w-full">
              <Link href="/admin/users">View all users</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
           <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>
              Recent platform-wide activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {platformActivity.map((activity, index) => (
                <div key={index} className="flex items-start">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {activity.type === 'New Coach' && <Briefcase className="h-5 w-5 text-muted-foreground"/>}
                        {activity.type === 'New Program' && <UserPlus className="h-5 w-5 text-muted-foreground"/>}
                        {activity.type === 'New Student' && <Users className="h-5 w-5 text-muted-foreground"/>}
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                            {activity.time}
                        </p>
                    </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
