/**
 * Normalizes material data from various potential formats (string URL, object with different field names)
 * and calculates display properties like type-based icons and formatted file sizes.
 */
export interface Material {
    fileName?: string;
    name?: string;
    url?: string;
    link?: string;
    fileType?: string;
    type?: string;
    fileSize?: number;
}

export function normalizeMaterial(mat: string | Material) {
    const isString = typeof mat === "string";
    const name = isString ? mat.split("/").pop()! : (mat.fileName || mat.name || "document");
    const link = isString ? mat : (mat.url || mat.link || "#");
    let type = isString ? (mat.endsWith(".pdf") ? "pdf" : "doc") : (mat.fileType || mat.type || "");

    // Normalize type
    const typeLower = type.toLowerCase();
    if (typeLower.includes("pdf")) type = "pdf";
    else if (typeLower.includes("video")) type = "video";
    else if (typeLower.includes("word") || typeLower.includes("officedocument") || typeLower.includes("doc")) type = "doc";
    else if (typeLower.includes("presentation") || typeLower.includes("powerpoint") || typeLower.includes("ppt")) type = "ppt";
    else type = "file";

    const sizeDisplay = !isString && mat.fileSize ?
        (mat.fileSize > 1024 * 1024 ? `${(mat.fileSize / (1024 * 1024)).toFixed(2)} MB` : `${(mat.fileSize / 1024).toFixed(2)} KB`)
        : null;

    return { name, link, type, sizeDisplay };
}

/**
 * Helper to get the correct icon for a material type
 */
import React from 'react';
import { Book, Presentation, StickyNote, File, Video } from "lucide-react";

export const getMaterialIcon = (type: string, size: number = 5) => {
    const className = `h-${size} w-${size}`;
    switch (type) {
        case "pdf":
            return React.createElement(Book, { className: `${className} text-red-500` });
        case "ppt":
            return React.createElement(Presentation, { className: `${className} text-orange-500` });
        case "doc":
            return React.createElement(StickyNote, { className: `${className} text-blue-500` });
        case "video":
            return React.createElement(Video, { className: `${className} text-blue-500` });
        default:
            return React.createElement(File, { className: `${className} text-muted-foreground` });
    }
};
