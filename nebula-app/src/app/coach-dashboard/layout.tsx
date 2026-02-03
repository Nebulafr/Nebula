"use client";

import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Wallet,
  Search,
  Bell,
  PanelLeft,
  MessageSquare,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
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
  const pathname = usePathname();
  let pageTitle = t("dashboard");

  if (pathname.includes("/settings")) {
    pageTitle = t("settings");
  } else if (pathname.includes("/programs")) {
    pageTitle = t("programs");
  } else if (pathname.includes("/schedule")) {
    pageTitle = t("schedule");
  } else if (pathname.includes("/students")) {
    pageTitle = t("students");
  } else if (pathname.includes("/payouts")) {
    pageTitle = t("payouts");
  } else if (pathname.includes("/messaging")) {
    pageTitle = t("messaging");
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

export default function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  const tc = useTranslations("dashboard.coach");
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

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
                  {profile?.fullName || tc("coach")}
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="overflow-y-auto">
            <SidebarMenu className="mt-6 space-y-1">
              <SidebarMenuItem>
                <Link href="/coach-dashboard">
                  <SidebarMenuButton
                    tooltip={t("dashboard")}
                    isActive={pathname === "/coach-dashboard"}
                    asChild
                  >
                    <div>
                      <LayoutDashboard />
                      <span>{t("dashboard")}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/programs">
                  <SidebarMenuButton
                    tooltip={t("programs")}
                    isActive={pathname.startsWith("/coach-dashboard/programs")}
                    asChild
                  >
                    <div>
                      <Briefcase />
                      <span>{t("programs")}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/schedule">
                  <SidebarMenuButton
                    tooltip={t("schedule")}
                    isActive={pathname.startsWith("/coach-dashboard/schedule")}
                    asChild
                  >
                    <div>
                      <Calendar />
                      <span>{t("schedule")}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/students">
                  <SidebarMenuButton
                    tooltip={t("students")}
                    isActive={pathname === "/coach-dashboard/students"}
                    asChild
                  >
                    <div>
                      <Users />
                      <span>{t("students")}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/payouts">
                  <SidebarMenuButton
                    tooltip={t("payouts")}
                    isActive={pathname === "/coach-dashboard/payouts"}
                    asChild
                  >
                    <div>
                      <Wallet />
                      <span>{t("payouts")}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/coach-dashboard/messaging">
                  <SidebarMenuButton
                    tooltip={t("messaging")}
                    isActive={pathname === "/coach-dashboard/messaging"}
                    asChild
                  >
                    <div>
                      <MessageSquare />
                      <span>{t("messaging")}</span>
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
                <Link href="/coach-dashboard/settings">
                  <SidebarMenuButton
                    tooltip={t("settings")}
                    isActive={pathname === "/coach-dashboard/settings"}
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
          <main className={cn("flex-1", pathname.includes("/messaging") ? "overflow-hidden" : "overflow-auto")}>
            <div className={cn("h-full", !pathname.includes("/messaging") && "dashboard-container py-6")}>{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
