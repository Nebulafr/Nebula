"use client";

import {
  Home,
  Briefcase,
  Users,
  Settings,
  CircleHelp,
  MessageSquare,
  Search,
  Bell,
  PanelLeft,
  ExternalLink,
  Calendar,
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
  if (pathname.includes("/programs")) {
    pageTitle = "Programs";
  } else if (pathname.includes("/coaches")) {
    pageTitle = "Coaches";
  } else if (pathname.includes("/messaging")) {
    pageTitle = "Messaging";
  } else if (pathname.includes("/my-sessions")) {
    pageTitle = "My Sessions";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background backdrop-blur-sm">
      <div className="dashboard-container flex h-full items-center gap-4">
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    profile?.avatarUrl || "https://i.pravatar.cc/150?u=student"
                  }
                />
                <AvatarFallback>
                  {profile?.fullName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <span className="font-headline text-lg font-bold">
                {profile?.fullName || "Student"}
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-y-auto">
          <SidebarMenu className="mt-6 space-y-1">
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton
                  tooltip="Dashboard"
                  isActive={pathname === "/dashboard"}
                  asChild
                >
                  <div>
                    <Home />
                    <span>Dashboard</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/programs">
                <SidebarMenuButton
                  tooltip="Programs"
                  isActive={pathname.startsWith("/programs")}
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
              <Link href="/coaches">
                <SidebarMenuButton
                  tooltip="Coaches"
                  isActive={pathname.startsWith("/coaches")}
                  asChild
                >
                  <div>
                    <Users />
                    <span>Coaches</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/my-sessions">
                <SidebarMenuButton
                  tooltip="My Sessions"
                  isActive={pathname.startsWith("/dashboard/my-sessions")}
                  asChild
                >
                  <div>
                    <Calendar />
                    <span>My Sessions</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/messaging">
                <SidebarMenuButton
                  tooltip="Messaging"
                  isActive={pathname === "/dashboard/messaging"}
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
              <Link href="#">
                <SidebarMenuButton tooltip="Help" asChild>
                  <div>
                    <CircleHelp />
                    <span>Help</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/settings">
                <SidebarMenuButton
                  tooltip="Settings"
                  isActive={pathname === "/dashboard/settings"}
                  asChild
                >
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
          <div className="h-full dashboard-container py-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
