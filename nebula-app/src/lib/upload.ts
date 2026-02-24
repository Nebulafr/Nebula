import { apiPost } from "./utils";

export interface UploadResult {
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

/**
 * Helper to convert a File object to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Upload a file to the server-side upload API
 */
export async function uploadFile(
    base64Data: string,
    folder: string = "nebula-uploads",
    resourceType: "auto" | "image" | "video" | "raw" = "auto"
): Promise<UploadResult> {
    // Send as JSON
    const response = await apiPost("/upload", {
        file: base64Data,
        folder,
        resourceType,
    });

    if (!response.success) {
        throw new Error(response.error || "Upload failed");
    }

    return response.data;
}

/**
 * Upload an image (shorthand)
 */
export async function uploadImage(
    file: File | string,
    folder: string = "nebula-images"
): Promise<string> {
    const base64Data = typeof file === "string" ? file : await fileToBase64(file);
    const result = await uploadFile(base64Data, folder, "image");
    return result.url;
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
    files: (File | string)[],
    folder: string = "nebula-materials"
): Promise<UploadResult[]> {
    const uploadPromises = files.map(async (file) => {
        const base64Data = typeof file === "string" ? file : await fileToBase64(file);
        return uploadFile(base64Data, folder);
    });
    return Promise.all(uploadPromises);
}
