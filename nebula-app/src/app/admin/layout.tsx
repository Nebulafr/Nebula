"use client";

import {
  Users,
  Settings,
  CircleHelp,
  PanelLeft,
  Search,
  Bell,
  Home,
  ExternalLink,
  GraduationCap,
  Calendar,
  Star,
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

function TopBar() {
  const pathname = usePathname();
  let pageTitle = "Dashboard";

  if (pathname.includes("/users")) {
    pageTitle = "User Management";
  } else if (pathname.includes("/programs")) {
    pageTitle = "Program Management";
  } else if (pathname.includes("/events")) {
    pageTitle = "Event Management";
  } else if (pathname.includes("/reviews")) {
    pageTitle = "Review Management";
  } else if (pathname.includes("/settings")) {
    pageTitle = "Settings";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background backdrop-blur-sm bg-background/95">
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="font-headline text-lg font-bold">Admin</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-y-auto">
          <SidebarMenu className="mt-6 space-y-1">
            <SidebarMenuItem>
              <Link href="/admin">
                <SidebarMenuButton
                  tooltip="Dashboard"
                  isActive={pathname === "/admin"}
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
              <Link href="/admin/users">
                <SidebarMenuButton
                  tooltip="Users"
                  isActive={pathname.startsWith("/admin/users")}
                  asChild
                >
                  <div>
                    <Users />
                    <span>Users</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/programs">
                <SidebarMenuButton
                  tooltip="Programs"
                  isActive={pathname.startsWith("/admin/programs")}
                  asChild
                >
                  <div>
                    <GraduationCap />
                    <span>Programs</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/events">
                <SidebarMenuButton
                  tooltip="Events"
                  isActive={pathname.startsWith("/admin/events")}
                  asChild
                >
                  <div>
                    <Calendar />
                    <span>Events</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/reviews">
                <SidebarMenuButton
                  tooltip="Reviews"
                  isActive={pathname.startsWith("/admin/reviews")}
                  asChild
                >
                  <div>
                    <Star />
                    <span>Reviews</span>
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
              <Link href="/admin/settings">
                <SidebarMenuButton
                  tooltip="Settings"
                  isActive={pathname.startsWith("/admin/settings")}
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
