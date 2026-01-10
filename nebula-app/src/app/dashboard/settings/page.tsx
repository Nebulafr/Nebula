"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, CreditCard, Download, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function StudentSettingsPage() {
  const user = {
    name: "Alex Thompson",
    email: "alex.t@nebula.com",
    avatar: "https://i.pravatar.cc/150?u=alex",
  };

  const invoices = [
    {
      invoice: "INV-2024-001",
      date: "July 1, 2024",
      amount: "$49.00",
      status: "Paid",
    },
    {
      invoice: "INV-2024-002",
      date: "June 1, 2024",
      amount: "$49.00",
      status: "Paid",
    },
    {
      invoice: "INV-2024-003",
      date: "May 1, 2024",
      amount: "$49.00",
      status: "Paid",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4 w-fit">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white/50 hover:bg-white/70 backdrop-blur-sm"
                >
                  <Camera className="h-4 w-4 text-foreground" />
                </Button>
              </div>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {user.name}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent className="text-center"></CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold leading-none tracking-tight">
                Profile Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button>Save Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold leading-none tracking-tight">
                Billing
              </h3>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Subscription Plan</p>
                    <p className="text-sm text-muted-foreground">
                      You are currently on the{" "}
                      <span className="font-medium text-primary">
                        Nebula Pro
                      </span>{" "}
                      plan.
                    </p>
                  </div>
                  <Button variant="outline">
                    Manage Plan <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Payment Method</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-5 w-5" />
                      <span>Visa ending in 1234</span>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Billing History</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">
                          {invoice.invoice}
                        </TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button>Save Billing Information</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold leading-none tracking-tight">
                Security
              </h3>
            </CardHeader>
            <CardContent className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label>Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Update your password here. Please choose a strong one.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="flex justify-end">
                  <Button>Change Password</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">
                    Two-Factor Authentication (2FA)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
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
      </div>
    </div>
  );
}
