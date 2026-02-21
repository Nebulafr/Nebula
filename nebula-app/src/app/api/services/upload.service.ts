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
        buffer: Buffer,
        options: {
            folder?: string;
            resourceType?: "auto" | "image" | "video" | "raw";
        }
    ): Promise<UploadResult> {
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
