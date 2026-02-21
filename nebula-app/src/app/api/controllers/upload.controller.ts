import { NextRequest } from "next/server";
import { uploadService } from "@/app/api/services/upload.service";
import { BadRequestException, UnauthorizedException } from "@/app/api/utils/http-exception";
import { sendSuccess } from "@/app/api/utils/send-response";

export class UploadController {
    async upload(request: NextRequest) {
        const user = (request as any).user;

        if (!user) {
            throw new UnauthorizedException("Authentication required");
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "nebula-uploads";
        const resourceType = (formData.get("resourceType") as "auto" | "image" | "video" | "raw") || "auto";

        if (!file) {
            throw new BadRequestException("No file provided");
        }

        // Convert File to Buffer for the service
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await uploadService.uploadFile(buffer, {
            folder,
            resourceType,
        });

        return sendSuccess(result, "File uploaded successfully", 201);
    }
}

export const uploadController = new UploadController();
