"use client";

import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  CircleHelp,
  Wallet,
  User,
  Search,
  Bell,
  PanelLeft,
  MessageSquare,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

function TopBar() {
  const pathname = usePathname();
  let pageTitle = "Dashboard";

  if (pathname.includes("/my-profile")) {
    pageTitle = "My Profile";
  } else if (pathname.includes("/programs")) {
    pageTitle = "Programs";
  } else if (pathname.includes("/schedule")) {
    pageTitle = "Schedule";
  } else if (pathname.includes("/students")) {
    pageTitle = "Students";
  } else if (pathname.includes("/payouts")) {
    pageTitle = "Payouts";
  } else if (pathname.includes("/messaging")) {
    pageTitle = "Messaging";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 backdrop-blur-sm bg-background/95">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-bold">{pageTitle}</h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to Homepage
          </Link>
        </Button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 w-64" />
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

function CollapseButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Collapse" onClick={() => toggleSidebar()}>
        <PanelLeft />
        <span>Collapse</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <div className="coach-theme">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      profile?.avatarUrl || "https://i.pravatar.cc/150?u=coach"
                    }
                  />
                  <AvatarFallback>
                    {profile?.fullName?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-headline text-lg font-bold">
                  {profile?.fullName || "Coach"}
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="overflow-y-auto">
            <SidebarMenu className="mt-6 space-y-1">
              <SidebarMenuItem>
                <Link href="/coach-dashboard">
                  <SidebarMenuButton
                    tooltip="Dashboard"
                    isActive={pathname === "/coach-dashboard"}
                    asChild
                  >
                    <div>
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/programs">
                  <SidebarMenuButton
                    tooltip="Programs"
                    isActive={pathname.startsWith("/coach-dashboard/programs")}
                    asChild
                  >
                    <div>
                      <Briefcase />
                      <span>Programs</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/my-profile">
                  <SidebarMenuButton
                    tooltip="My Profile"
                    isActive={pathname === "/coach-dashboard/my-profile"}
                    asChild
                  >
                    <div>
                      <User />
                      <span>My Profile</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/schedule">
                  <SidebarMenuButton
                    tooltip="Schedule"
                    isActive={pathname.startsWith("/coach-dashboard/schedule")}
                    asChild
                  >
                    <div>
                      <Calendar />
                      <span>Schedule</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/students">
                  <SidebarMenuButton
                    tooltip="Students"
                    isActive={pathname === "/coach-dashboard/students"}
                    asChild
                  >
                    <div>
                      <Users />
                      <span>Students</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/payouts">
                  <SidebarMenuButton
                    tooltip="Payouts"
                    isActive={pathname === "/coach-dashboard/payouts"}
                    asChild
                  >
                    <div>
                      <Wallet />
                      <span>Payouts</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/messaging">
                  <SidebarMenuButton
                    tooltip="Messaging"
                    isActive={pathname === "/coach-dashboard/messaging"}
                    asChild
                  >
                    <div>
                      <MessageSquare />
                      <span>Messaging</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <CollapseButton />
              <SidebarMenuItem>
                <Link href="/help-center">
                  <SidebarMenuButton tooltip="Help" asChild>
                    <div>
                      <CircleHelp />
                      <span>Help</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="#">
                  <SidebarMenuButton tooltip="Settings" asChild>
                    <div>
                      <Settings />
                      <span>Settings</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <TopBar />
          <main className="flex-1 overflow-auto">
            <div className="h-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
