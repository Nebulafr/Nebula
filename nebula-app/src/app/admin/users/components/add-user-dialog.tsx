"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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

interface AddUserDialogProps {
  onAddUser?: (userData: NewUserData) => Promise<void>;
  loading?: boolean;
}

interface NewUserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

export function AddUserDialog({ onAddUser, loading = false }: AddUserDialogProps) {
  const t = useTranslations("dashboard.admin");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewUserData>({
    name: '',
    email: '',
    role: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.role && formData.password) {
      setIsSubmitting(true);
      try {
        await onAddUser?.(formData);
        setFormData({ name: '', email: '', role: '', password: '' });
        setIsOpen(false);
      } catch (error) {
        console.error("Error submitting form:", error);
        // Form will remain open so user can try again
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid = formData.name && formData.email && formData.role && formData.password;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting) {
        setIsOpen(open);
        if (!open) {
          // Reset form when closing
          setFormData({ name: '', email: '', role: '', password: '' });
        }
      }
    }}>
      <DialogTrigger asChild>
        <Button disabled={loading || isSubmitting}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("addUser")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addNewUser")}</DialogTitle>
          <DialogDescription>
            {t("addUserDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t("name")}
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="col-span-3"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isFormValid || loading || isSubmitting}>
              {isSubmitting ? t("creating") : t("addNewUser")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}