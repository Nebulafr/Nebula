"use client";
/* eslint-disable */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export function CheckoutStatusModal() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations("common.checkout");

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | null>(null);

    useEffect(() => {
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled") || searchParams.get("cancelled");

        if (success) {
            setStatus("success");
            setOpen(true);
        } else if (canceled) {
            setStatus("error");
            setOpen(true);
        } else {
            setOpen(false);
            setStatus(null);
        }
    }, [searchParams]);

    const handleClose = () => {
        setOpen(false);
        // Remove query params
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("success");
        newSearchParams.delete("canceled");
        newSearchParams.delete("cancelled");
        router.replace(`${pathname}?${newSearchParams.toString()}`);
    };

    if (!status) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        {status === "success" ? (
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        ) : (
                            <XCircle className="h-12 w-12 text-red-500" />
                        )}
                    </div>
                    <DialogTitle className="text-center">
                        {status === "success" ? t("success.title") : t("error.title")}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {status === "success"
                            ? t("success.description")
                            : t("error.description")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button onClick={handleClose} variant={status === "success" ? "default" : "secondary"}>
                        {status === "success" ? t("success.button") : t("error.button")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
