"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,   
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"; // Kept as it's used later
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Kept as it's used later
import { format } from "date-fns"; // Added format
import { enUS, fr } from "date-fns/locale"; // Added date-fns locales
import { useTranslations, useLocale } from "next-intl"; // Added next-intl hooks
import Link from "next/link";
import { formatUserName, getUserInitials } from "@/lib/chat-utils";
import { getDefaultAvatar } from "@/lib/event-utils";

interface RecentSignup {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joined?: string;
}

interface RecentSignupsProps {
  signups: RecentSignup[];
  loading?: boolean;
  onUserAction?: (user: RecentSignup, action: string) => void;
}

export function RecentSignups({ signups, loading, onUserAction }: RecentSignupsProps) {
  const t = useTranslations("dashboard.admin");
  const locale = useLocale();
  const dateLocale = locale === "fr" ? fr : enUS;

  if (loading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>{t("recentSignups")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center text-sm font-medium text-muted-foreground px-1">
              <div className="flex-1">{t("user")}</div>
              <div className="w-24 text-center">{t("role")}</div>
              <div className="w-24 text-right">{t("date")}</div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="flex-1 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-24 text-center">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                </div>
                <div className="w-24 text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{t("recentSignups")}</CardTitle>
      </CardHeader>
      <CardContent>
        {signups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noRecentSignups")}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead className="text-right">{t("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups.map((user, index) => {
                  const displayName = formatUserName(user.name);
                  const initials = getUserInitials(user.name);

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={user.avatar || getDefaultAvatar(user.name)}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{displayName}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role.toLowerCase() === "coach"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.role.toLowerCase() === "coach"
                            ? t("coach")
                            : user.role.toLowerCase() === "student"
                            ? t("student")
                            : user.role.toLowerCase() === "admin"
                            ? t("admin")
                            : user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {user.joined ? format(new Date(user.joined), "MMM d", { locale: dateLocale }) : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
              <Link href="/admin/users">{t("viewAllUsers")}</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
