'use client';

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
import { Search } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

const students = [
  {
    name: 'Alex Thompson',
    avatar: 'https://i.pravatar.cc/40?u=alex',
    program: 'Consulting, Associate Level',
    status: 'Active',
    lastContact: '2 days ago',
  },
  {
    name: 'Sarah K.',
    avatar: 'https://i.pravatar.cc/40?u=sarah',
    program: 'MBA Admissions Coaching',
    status: 'Active',
    lastContact: '5 days ago',
  },
  {
    name: 'Michael T.',
    avatar: 'https://i.pravatar.cc/40?u=michael',
    program: 'Consulting, Associate Level',
    status: 'Completed',
    lastContact: '1 month ago',
  },
  {
    name: 'Jessica L.',
    avatar: 'https://i.pravatar.cc/40?u=jessica',
    program: 'Consulting, Associate Level',
    status: 'Paused',
    lastContact: '3 weeks ago',
  },
];

export default function StudentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
       <Card>
        <CardHeader>
          <CardTitle>My Students</CardTitle>
           <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-9" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.program}</TableCell>
                  <TableCell>
                    <Badge variant={
                        student.status === 'Active' ? 'default' : 
                        student.status === 'Completed' ? 'secondary' : 'outline'
                    }>
                        {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.lastContact}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View Profile</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
