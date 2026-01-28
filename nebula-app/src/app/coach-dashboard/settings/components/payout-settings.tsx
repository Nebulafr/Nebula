"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface PayoutSettingsData {
  payoutMethod: "bank" | "paypal" | "stripe";
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  routingNumber?: string;
  paypalEmail?: string;
  stripeAccountId?: string;
  isVerified: boolean;
}

interface PayoutSettingsProps {
  data?: PayoutSettingsData;
  onSave: (data: PayoutSettingsData) => void;
  isLoading?: boolean;
}

const DEFAULT_DATA: PayoutSettingsData = {
  payoutMethod: "bank",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  routingNumber: "",
  paypalEmail: "",
  stripeAccountId: "",
  isVerified: false,
};

export function PayoutSettings({
  data = DEFAULT_DATA,
  onSave,
  isLoading = false,
}: PayoutSettingsProps) {
  const t = useTranslations("dashboard.coach.settings.payout");
  const [formData, setFormData] = useState<PayoutSettingsData>(data);

  const handleChange = (field: keyof PayoutSettingsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>
          {formData.isVerified ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t("verified")}
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t("notVerified")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>{t("method")}</Label>
          <Select
            value={formData.payoutMethod}
            onValueChange={(value) =>
              handleChange(
                "payoutMethod",
                value as "bank" | "paypal" | "stripe"
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectMethod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {t("bankTransfer")}
                </div>
              </SelectItem>
              <SelectItem value="paypal">{t("paypal")}</SelectItem>
              <SelectItem value="stripe">{t("stripe")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {formData.payoutMethod === "bank" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">{t("bankName")}</Label>
              <Input
                id="bankName"
                value={formData.bankName || ""}
                onChange={(e) => handleChange("bankName", e.target.value)}
                placeholder={t("bankNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">{t("accountHolder")}</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName || ""}
                onChange={(e) =>
                  handleChange("accountHolderName", e.target.value)
                }
                placeholder={t("accountHolderPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="routingNumber">{t("routing")}</Label>
                <Input
                  id="routingNumber"
                  value={formData.routingNumber || ""}
                  onChange={(e) =>
                    handleChange("routingNumber", e.target.value)
                  }
                  placeholder={t("routingPlaceholder")}
                  maxLength={9}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">{t("accountNumber")}</Label>
                <Input
                  id="accountNumber"
                  type="password"
                  value={formData.accountNumber || ""}
                  onChange={(e) =>
                    handleChange("accountNumber", e.target.value)
                  }
                  placeholder={t("accountNumberPlaceholder")}
                />
              </div>
            </div>
          </div>
        )}

        {formData.payoutMethod === "paypal" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">{t("paypalEmail")}</Label>
              <Input
                id="paypalEmail"
                type="email"
                value={formData.paypalEmail || ""}
                onChange={(e) => handleChange("paypalEmail", e.target.value)}
                placeholder={t("paypalEmailPlaceholder")}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("paypalInfo")}
            </p>
          </div>
        )}

        {formData.payoutMethod === "stripe" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                {t("stripeInfo")}
              </p>
              <Button variant="outline" className="mt-3">
                {t("connectStripe")}
              </Button>
            </div>
            {formData.stripeAccountId && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {t("stripeConnected")}
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
