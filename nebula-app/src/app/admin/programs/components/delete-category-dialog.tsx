"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface DeleteCategoryDialogProps {
  categoryName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryName: string) => void;
  loading?: boolean;
}

export function DeleteCategoryDialog({
  categoryName,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeleteCategoryDialogProps) {
  const t = useTranslations("dashboard.admin");

  const handleConfirm = () => {
    if (categoryName) {
      onConfirm(categoryName);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("areYouSure")}</AlertDialogTitle>
          <AlertDialogDescription>
            {categoryName && t("deleteCategoryDesc", { name: categoryName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}