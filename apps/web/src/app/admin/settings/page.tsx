
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
import { useTranslations } from 'next-intl';

export default function AdminSettingsPage() {
  const t = useTranslations("dashboard.admin");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("generalSettings")}</CardTitle>
          <CardDescription>
            {t("generalSettingsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-name">{t("siteName")}</Label>
            <Input id="site-name" defaultValue="Nebula" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">{t("supportEmail")}</Label>
            <Input
              id="support-email"
              type="email"
              defaultValue="support@nebula.com"
            />
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button>{t("saveGeneralSettings")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("notificationSettings")}</CardTitle>
          <CardDescription>
            {t("notificationSettingsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{t("newUserSignups")}</p>
              <p className="text-sm text-muted-foreground">
                {t("newUserSignupsDesc")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{t("newCoachApplications")}</p>
              <p className="text-sm text-muted-foreground">
                {t("newCoachApplicationsDesc")}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{t("weeklySummary")}</p>
              <p className="text-sm text-muted-foreground">
                {t("weeklySummaryDesc")}
              </p>
            </div>
            <Switch />
          </div>
           <Separator />
          <div className="flex justify-end">
            <Button>{t("saveNotificationSettings")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("security")}</CardTitle>
          <CardDescription>{t("securityDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password-policy">{t("passwordPolicy")}</Label>
             <Select defaultValue="medium">
                <SelectTrigger id="password-policy">
                    <SelectValue placeholder={t("selectPolicy")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="simple">{t("simplePolicy")}</SelectItem>
                    <SelectItem value="medium">{t("mediumPolicy")}</SelectItem>
                    <SelectItem value="strong">{t("strongPolicy")}</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{t("twoFactorAuth")}</p>
              <p className="text-sm text-muted-foreground">
                {t("twoFactorAuthDesc")}
              </p>
            </div>
            <Switch />
          </div>
           <Separator />
           <div className="flex justify-end">
            <Button>{t("saveSecuritySettings")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
