import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { type UploadResult } from "../types.js";

// Configuration
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class UploadService {
  /** Upload an image to Cloudinary */
  async uploadImage(
    file: Buffer | string,
    options?: {
      folder?: string;
      publicId?: string;
      transformation?: object;
    },
  ): Promise<UploadResult> {
    const result = await cloudinary.uploader.upload(
      typeof file === "string"
        ? file
        : `data:image/png;base64,${file.toString("base64")}`,
      {
        folder: options?.folder || "nebula-images",
        public_id: options?.publicId,
        transformation: options?.transformation,
        resource_type: "image",
      },
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: result.original_filename,
      fileType: result.format,
      fileSize: result.bytes,
    };
  }

  /** Upload any file to Cloudinary */
  async uploadFile(
    file: Buffer | string,
    options?: {
      folder?: string;
      publicId?: string;
      resourceType?: "auto" | "image" | "video" | "raw";
    },
  ): Promise<UploadResult> {
    let buffer: Buffer;

    if (typeof file === "string") {
      const base64Content = file.includes(",")
        ? file.split(",")[1]
        : file;
      buffer = Buffer.from(base64Content, "base64");
    } else {
      buffer = file;
    }

    const { folder = "nebula-uploads", resourceType = "auto" } = options || {};

    const result = await cloudinary.uploader.upload(
      typeof file === "string" && file.startsWith("data:")
        ? file
        : `data:application/octet-stream;base64,${buffer.toString("base64")}`,
      {
        folder: folder || "nebula-materials",
        public_id: options?.publicId,
        resource_type: resourceType || "auto",
      },
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: result.original_filename,
      fileType: result.format,
      fileSize: result.bytes,
    };
  }

  /** Upload avatar image to Cloudinary */
  async uploadAvatar(file: Buffer | string, userId?: string): Promise<UploadResult> {
    let buffer: Buffer | string = file;

    if (typeof file === "string" && file.startsWith("data:")) {
      buffer = file;
    } else if (typeof file === "string") {
      buffer = Buffer.from(file, "base64");
    }

    return this.uploadImage(buffer, {
      folder: "nebula-avatars",
      publicId: userId ? `avatar-${userId}` : undefined,
      transformation: {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
      },
    });
  }

  /** Delete a file from Cloudinary */
  async deleteFile(
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image",
  ): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  }
}

export const uploadService = new UploadService();
