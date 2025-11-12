
'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Briefcase, GraduationCap, Star } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { createProgram } from '@/firebase/firestore/create-program';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const programs = [
    {
        title: 'Consulting, Associate Level',
        category: 'Career Prep',
        icon: <Briefcase className="h-5 w-5 text-primary" />,
        slug: '/programs/consulting-associate-level',
        rating: 4.9,
        students: 58,
    },
    {
        title: 'MBA Admissions Coaching',
        category: 'School Admissions',
        icon: <GraduationCap className="h-5 w-5 text-blue-500" />,
        slug: '/programs/mba-admissions',
        rating: 4.8,
        students: 32,
    }
];


export default function CoachProgramsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Programs</h2>
        <CreateProgramDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
             <Card key={program.title} className="flex flex-col">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${program.category === 'Career Prep' ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
                            {program.icon}
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <h3 className="font-headline text-xl font-semibold">{program.title}</h3>
                    <p className="text-sm text-muted-foreground">{program.category}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span>{program.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{program.students} students</span>
                        </div>
                    </div>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="#">View Details</Link>
                    </Button>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}


function CreateProgramDialog() {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [objectives, setObjectives] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        const objectivesArray = objectives.split('\n').filter(o => o.trim() !== '');

        try {
            await createProgram(db, user.uid, {
                title,
                category,
                description,
                objectives: objectivesArray
            });
            toast({ title: 'Success!', description: 'Your new program has been created.' });
            setOpen(false);
            // Reset form
            setTitle('');
            setCategory('');
            setDescription('');
            setObjectives('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create the program.' });
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Program
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Program</DialogTitle>
                    <DialogDescription>Fill out the details for your new coaching program.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" placeholder="e.g., Career Prep" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="objectives" className="text-right">Objectives</Label>
                            <Textarea id="objectives" value={objectives} onChange={(e) => setObjectives(e.target.value)} className="col-span-3" placeholder="Enter one objective per line." required/>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Create Program</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

    