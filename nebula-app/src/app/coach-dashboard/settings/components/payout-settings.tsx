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
              Payout Information
            </CardTitle>
            <CardDescription>
              Configure how you want to receive your earnings
            </CardDescription>
          </div>
          {formData.isVerified ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Payout Method</Label>
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
              <SelectValue placeholder="Select payout method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bank Transfer (ACH)
                </div>
              </SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="stripe">Stripe Connect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {formData.payoutMethod === "bank" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName || ""}
                onChange={(e) => handleChange("bankName", e.target.value)}
                placeholder="e.g., Chase, Bank of America"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName || ""}
                onChange={(e) =>
                  handleChange("accountHolderName", e.target.value)
                }
                placeholder="Name as it appears on account"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  value={formData.routingNumber || ""}
                  onChange={(e) =>
                    handleChange("routingNumber", e.target.value)
                  }
                  placeholder="9 digits"
                  maxLength={9}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="password"
                  value={formData.accountNumber || ""}
                  onChange={(e) =>
                    handleChange("accountNumber", e.target.value)
                  }
                  placeholder="Account number"
                />
              </div>
            </div>
          </div>
        )}

        {formData.payoutMethod === "paypal" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                value={formData.paypalEmail || ""}
                onChange={(e) => handleChange("paypalEmail", e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Payouts will be sent to this PayPal account. Make sure this email
              is associated with a verified PayPal account.
            </p>
          </div>
        )}

        {formData.payoutMethod === "stripe" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                Connect your Stripe account to receive payouts directly. This is
                the fastest and most secure method.
              </p>
              <Button variant="outline" className="mt-3">
                Connect Stripe Account
              </Button>
            </div>
            {formData.stripeAccountId && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Stripe account connected
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
                Saving...
              </>
            ) : (
              "Save Payout Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
