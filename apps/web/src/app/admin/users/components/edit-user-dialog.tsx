"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface EditUserDialogProps {
  user: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (userId: string, userData: any) => Promise<void>;
  loading?: boolean;
}

export function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
  onUpdateUser,
  loading = false,
}: EditUserDialogProps) {
  const t = useTranslations("dashboard.admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role?.toLowerCase() || "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.email && formData.role) {
      setIsSubmitting(true);
      try {
        await onUpdateUser(user.id, {
          ...formData,
          role: formData.role.toUpperCase(),
        });
        onOpenChange(false);
      } catch (error) {
        console.error("Error updating user:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid =
    formData.firstName && formData.lastName && formData.email && formData.role;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting) {
        onOpenChange(open);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editUser") || "Edit User"}</DialogTitle>
          <DialogDescription>
            {t("editUserDescription") || "Update user details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-firstName" className="text-right">
                {t("firstName") || "First Name"}
              </Label>
              <Input
                id="edit-firstName"
                placeholder="John"
                className="col-span-3"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-lastName" className="text-right">
                {t("lastName") || "Last Name"}
              </Label>
              <Input
                id="edit-lastName"
                placeholder="Doe"
                className="col-span-3"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                {t("email")}
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john@example.com"
                className="col-span-3"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                {t("role")}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{t("student")}</SelectItem>
                  <SelectItem value="coach">{t("coach")}</SelectItem>
                  <SelectItem value="admin">{t("admin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!isFormValid || loading || isSubmitting}
            >
              {isSubmitting ? t("saving") || "Saving..." : t("saveChanges") || "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
