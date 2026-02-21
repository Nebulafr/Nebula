import { apiPost } from "./utils";

export interface UploadResult {
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

/**
 * Upload a file to the server-side upload API
 */
export async function uploadFile(
    file: File,
    folder: string = "nebula-uploads",
    resourceType: "auto" | "image" | "video" | "raw" = "auto"
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("resourceType", resourceType);

    // Use the existing apiPost utility which handles auth headers
    const response = await apiPost("/upload", formData);

    if (!response.success) {
        throw new Error(response.error || "Upload failed");
    }

    return response.data;
}

/**
 * Upload an image (shorthand)
 */
export async function uploadImage(
    file: File,
    folder: string = "nebula-images"
): Promise<string> {
    const result = await uploadFile(file, folder, "image");
    return result.url;
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
    files: File[],
    folder: string = "nebula-materials"
): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => uploadFile(file, folder));
    return Promise.all(uploadPromises);
}
