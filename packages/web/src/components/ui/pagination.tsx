import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number | ((prev: number) => number)) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={cn("mt-12 flex items-center justify-center gap-2", className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => typeof onPageChange === 'function' && onPageChange((p: number) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 rounded-xl"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-1 mx-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                        // Show first, last, current, and pages around current
                        return (
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - currentPage) <= 1
                        );
                    })
                    .map((p, i, arr) => {
                        const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                        return (
                            <React.Fragment key={p}>
                                {showEllipsis && (
                                    <span className="px-2 text-muted-foreground">...</span>
                                )}
                                <Button
                                    variant={currentPage === p ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(p)}
                                    className={cn(
                                        "h-10 w-10 rounded-xl font-semibold",
                                        currentPage === p ? "shadow-md" : "hover:border-primary"
                                    )}
                                >
                                    {p}
                                </Button>
                            </React.Fragment>
                        );
                    })}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => typeof onPageChange === 'function' && onPageChange((p: number) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-10 w-10 rounded-xl"
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
}
