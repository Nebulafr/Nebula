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

    async uploadAvatar(buffer: Buffer, userId: string): Promise<UploadResult> {
        return await cloudinaryServer.uploadAvatar(buffer, userId);
    }
}

export const uploadService = new UploadService();
