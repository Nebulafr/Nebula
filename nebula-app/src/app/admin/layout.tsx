"use client";

import {
  Users,
  Settings,
  LogOut,
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
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
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
  const t = useTranslations("common");
  const td = useTranslations("dashboard.admin");
  const pathname = usePathname();
  let pageTitle = t("dashboard");

  if (pathname.includes("/users")) {
    pageTitle = td("userManagement");
  } else if (pathname.includes("/programs")) {
    pageTitle = td("programManagement");
  } else if (pathname.includes("/events")) {
    pageTitle = td("eventManagement");
  } else if (pathname.includes("/reviews")) {
    pageTitle = td("reviewManagement");
  } else if (pathname.includes("/settings")) {
    pageTitle = t("settings");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background backdrop-blur-sm px-4">
      <div className="flex h-full w-full justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-bold">{pageTitle}</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("goToHomepage")}
            </Link>
          </Button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("search") + "..."} className="pl-9 w-64" />
          </div>
          <LanguageSwitcher />
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function CollapseButton() {
  const t = useTranslations("common");
  const { toggleSidebar } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={t("collapse")} onClick={() => toggleSidebar()}>
        <PanelLeft />
        <span>{t("collapse")}</span>
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
  const t = useTranslations("common");
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatarUrl || undefined} />
                <AvatarFallback>
                  {profile?.fullName?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span className="font-headline text-lg font-bold">{t("admin")}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-y-auto">
          <SidebarMenu className="mt-6 space-y-1">
            <SidebarMenuItem>
              <Link href="/admin">
                <SidebarMenuButton
                  tooltip={t("dashboard")}
                  isActive={pathname === "/admin"}
                  asChild
                >
                  <div>
                    <Home />
                    <span>{t("dashboard")}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/users">
                <SidebarMenuButton
                  tooltip={t("users")}
                  isActive={pathname.startsWith("/admin/users")}
                  asChild
                >
                  <div>
                    <Users />
                    <span>{t("users")}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/programs">
                <SidebarMenuButton
                  tooltip={t("programs")}
                  isActive={pathname.startsWith("/admin/programs")}
                  asChild
                >
                  <div>
                    <GraduationCap />
                    <span>{t("programs")}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/events">
                <SidebarMenuButton
                  tooltip={t("events")}
                  isActive={pathname.startsWith("/admin/events")}
                  asChild
                >
                  <div>
                    <Calendar />
                    <span>{t("events")}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/reviews">
                <SidebarMenuButton
                  tooltip={t("reviews")}
                  isActive={pathname.startsWith("/admin/reviews")}
                  asChild
                >
                  <div>
                    <Star />
                    <span>{t("reviews")}</span>
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
              <Link href="/admin/settings">
                <SidebarMenuButton
                  tooltip={t("settings")}
                  isActive={pathname.startsWith("/admin/settings")}
                  asChild
                >
                  <div>
                    <Settings />
                    <span>{t("settings")}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={t("logout")}
                onClick={handleLogout}
              >
                <LogOut />
                <span>{t("logout")}</span>
              </SidebarMenuButton>
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
