
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage your application's basic information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" defaultValue="Nebula" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              defaultValue="support@nebula.com"
            />
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button>Save General Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure which email notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">New User Sign-ups</p>
              <p className="text-sm text-muted-foreground">
                Receive an email when a new user joins the platform.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">New Coach Applications</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a new coach applies to join.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">Weekly Summary</p>
              <p className="text-sm text-muted-foreground">
                Receive a weekly digest of platform activity.
              </p>
            </div>
            <Switch />
          </div>
           <Separator />
          <div className="flex justify-end">
            <Button>Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your site's security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="password-policy">Password Policy</Label>
             <Select defaultValue="medium">
                <SelectTrigger id="password-policy">
                    <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="simple">Simple (min. 8 characters)</SelectItem>
                    <SelectItem value="medium">Medium (min. 10 characters, 1 number)</SelectItem>
                    <SelectItem value="strong">Strong (min. 12 characters, 1 number, 1 symbol)</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">Two-Factor Authentication (2FA)</p>
              <p className="text-sm text-muted-foreground">
                Require all admins to use two-factor authentication.
              </p>
            </div>
            <Switch />
          </div>
           <Separator />
           <div className="flex justify-end">
            <Button>Save Security Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
