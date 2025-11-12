
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/firebase/auth/use-user';
import { useEffect, useState } from 'react';

export default function CoachProfilePage() {
  const { user, profile: userProfile, coachProfile } = useUser();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [pastCompanies, setPastCompanies] = useState<string[]>([]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || '');
    }
    if (coachProfile) {
      setRole(coachProfile.title || '');
      setBio(coachProfile.bio || '');
      setSpecialties(coachProfile.specialties || []);
      setPastCompanies(coachProfile.pastCompanies || []);
    }
  }, [userProfile, coachProfile]);

  if (!user) {
    return <div>Loading...</div>;
  }
  
  const coach = {
    name: name,
    role: role,
    avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
    bio: bio,
    specialties: specialties,
    pastCompanies: pastCompanies,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={coach.avatar} />
                <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{coach.name}</CardTitle>
              <CardDescription>{coach.role}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
               <Button className="w-full">Change Photo</Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Update your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Title</Label>
                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <p className="text-sm text-muted-foreground">Add tags that describe your expertise.</p>
                <div className="flex flex-wrap gap-2">
                  {coach.specialties.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
                 <Input id="specialties" placeholder="Add a new specialty..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastCompanies">Work Experience</Label>
                <p className="text-sm text-muted-foreground">Add companies you've worked at.</p>
                <div className="flex flex-wrap gap-2">
                  {coach.pastCompanies.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                </div>
                 <Input id="pastCompanies" placeholder="Add a new company..." />
              </div>
              <Separator />
               <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
