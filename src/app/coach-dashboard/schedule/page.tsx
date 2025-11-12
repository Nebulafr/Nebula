
'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const appointments = {
  '2024-08-20': [
    { time: '09:00 AM', student: 'Alex Thompson', avatar: 'https://i.pravatar.cc/40?u=alex' },
    { time: '11:00 AM', student: 'Sarah K.', avatar: 'https://i.pravatar.cc/40?u=sarah' },
  ],
  '2024-08-22': [
    { time: '02:00 PM', student: 'Michael T.', avatar: 'https://i.pravatar.cc/40?u=michael' },
  ],
};

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date('2024-08-20'));
  
  const selectedDateString = date ? date.toISOString().split('T')[0] : '';
  const selectedAppointments = appointments[selectedDateString as keyof typeof appointments] || [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  modifiers={{ booked: Object.keys(appointments).map(d => new Date(d)) }}
                  modifiersStyles={{ booked: { border: '2px solid hsl(var(--primary))' } }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAppointments.length > 0 ? (
                <ul className="space-y-4">
                  {selectedAppointments.map((appt: any, i: number) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={appt.avatar} />
                          <AvatarFallback>{appt.student.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{appt.student}</p>
                          <p className="text-sm text-muted-foreground">{appt.time}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Details</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center">No appointments for this day.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
