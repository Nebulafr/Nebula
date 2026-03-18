"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema, type CreateCategoryData } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
  onSubmit: (data: CreateCategoryData) => Promise<void>;
  isPending: boolean;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isPending,
}: CategoryDialogProps) {
  const t = useTranslations("dashboard.admin");
  const tc = useTranslations("common");

  const form = useForm<CreateCategoryData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      assetUrl: "",
      description: "",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        assetUrl: category.assetUrl || "",
        description: category.description || "",
      });
    } else {
      form.reset({
        name: "",
        assetUrl: "",
        description: "",
      });
    }
  }, [category, form, open]);

  const handleFormSubmit = async (data: CreateCategoryData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? t("editCategory") : t("addCategory")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("categoryName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("newCategoryPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("assetUrl")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.png"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("description")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("saveCategory")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
