"use client";

import React from "react";
import { Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeMaterial, getMaterialIcon, Material } from "@/lib/material-utils";
import { Button } from "@/components/ui/button";

interface MaterialItemProps {
    material: Material;
    index?: number;
    className?: string;
    showDownload?: boolean;
}

export function MaterialLink({ material, className, showDownload = true }: Omit<MaterialItemProps, 'index'>) {
    const { type, sizeDisplay } = normalizeMaterial(material);
    const isPdf = type === "pdf";

    return (
        <div
            className={cn(
                "group flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors",
                className
            )}
        >
            <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 min-w-0"
            >
                {getMaterialIcon(type, 4)}
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate">{material.fileName}</span>
                    {sizeDisplay && <span className="text-[10px] text-muted-foreground">{sizeDisplay}</span>}
                </div>
            </a>

            <div className="flex items-center gap-1">
                {showDownload && isPdf && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-primary hover:bg-primary/10"
                        asChild
                    >
                        <a href={material.url} target="_blank"
                            rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
                <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors"
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </div>
        </div>
    );
}
