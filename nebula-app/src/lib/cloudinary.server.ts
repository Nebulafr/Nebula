/**
 * Server-side Cloudinary utilities (Node.js only)
 * Only import this file in API routes, server actions, or server components
 */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

interface UploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

/**
 * Upload an image to Cloudinary (server-side)
 */
export const uploadImage = async (
  file: Buffer | string,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: object;
  },
): Promise<UploadResult> => {
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
};

/**
 * Upload any file to Cloudinary (server-side)
 */
export const uploadFile = async (
  file: Buffer | string,
  options?: {
    folder?: string;
    publicId?: string;
    resourceType?: "auto" | "image" | "video" | "raw";
  },
): Promise<UploadResult> => {
  const result = await cloudinary.uploader.upload(
    typeof file === "string"
      ? file
      : `data:application/octet-stream;base64,${file.toString("base64")}`,
    {
      folder: options?.folder || "nebula-materials",
      public_id: options?.publicId,
      resource_type: options?.resourceType || "auto",
    },
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    fileName: result.original_filename,
    fileType: result.format,
    fileSize: result.bytes,
  };
};

/**
 * Upload avatar image to Cloudinary (server-side)
 */
export const uploadAvatar = async (
  file: Buffer | string,
  userId?: string,
): Promise<UploadResult> => {
  return uploadImage(file, {
    folder: "nebula-avatars",
    publicId: userId ? `avatar-${userId}` : undefined,
    transformation: {
      width: 200,
      height: 200,
      crop: "fill",
      gravity: "face",
    },
  });
};

/**
 * Delete a file from Cloudinary
 */
export const deleteFile = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<boolean> => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
  return result.result === "ok";
};

/**
 * Generate a signed upload URL for client-side uploads
 */
export const generateSignedUploadUrl = (
  folder: string = "nebula-uploads",
): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
} => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
};

/**
 * Get optimized image URL with transformations
 */
export const getOptimizedUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  },
): string => {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    crop: options?.crop || "fill",
    quality: options?.quality || "auto",
    format: options?.format || "auto",
    secure: true,
  });
};

/**
 * Get download URL for a file (forces download)
 */
export const getDownloadUrl = (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw",
): string => {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    flags: "attachment",
    secure: true,
  });
};
