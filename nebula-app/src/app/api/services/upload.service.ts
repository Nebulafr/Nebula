import * as cloudinaryServer from "@/lib/cloudinary.server";

export interface UploadResult {
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

export class UploadService {
    async uploadFile(
        file: Buffer | string,
        options: {
            folder?: string;
            resourceType?: "auto" | "image" | "video" | "raw";
        }
    ): Promise<UploadResult> {
        let buffer: Buffer;

        if (typeof file === "string") {
            // Convert base64 to Buffer
            const base64Content = file.includes(",")
                ? file.split(",")[1]
                : file;
            buffer = Buffer.from(base64Content, "base64");
        } else {
            buffer = file;
        }

        const { folder = "nebula-uploads", resourceType = "auto" } = options;

        if (resourceType === "image") {
            return await cloudinaryServer.uploadImage(buffer, { folder });
        } else {
            return await cloudinaryServer.uploadFile(buffer, { folder, resourceType });
        }
    }

    async uploadAvatar(file: Buffer | string, userId: string): Promise<UploadResult> {
        let buffer: Buffer | string = file;

        if (typeof file === "string" && file.startsWith("data:")) {
            // It's already a base64 string with prefix, Cloudinary handles this
            buffer = file;
        } else if (typeof file === "string") {
            // Pure base64, convert to Buffer
            buffer = Buffer.from(file, "base64");
        }

        return await cloudinaryServer.uploadAvatar(buffer, userId);
    }
}

export const uploadService = new UploadService();
