/**
 * Client-side Cloudinary utilities (safe for browser)
 * For server-side operations, use cloudinary.server.ts
 */

/**
 * Upload image from client-side (unsigned upload with preset)
 */
export const uploadImageFromClient = async (
  file: File,
  folder: string = "nebula-images",
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Upload any file from client-side (unsigned upload with preset)
 */
export const uploadFileFromClient = async (
  file: File,
  folder: string = "nebula-materials",
): Promise<{
  url: string;
  name: string;
  type: string;
  size: number;
}> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `File upload failed: ${errorData.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  return {
    url: data.secure_url, 
    name: file.name,
    type: file.type,
    size: file.size,
  };
};

/**
 * Upload multiple files from client-side
 */
export const uploadMultipleFilesFromClient = async (
  files: File[],
  folder: string = "nebula-materials",
): Promise<any[]> => {
  const uploadPromises = files.map((file) =>
    uploadFileFromClient(file, folder),
  );
  const results = await Promise.all(uploadPromises);
  return results;
};

// Legacy exports for backward compatibility
export const uploadImageToCloudinary = uploadImageFromClient;
export const uploadAvatarToCloudinary = (file: File) =>
  uploadImageFromClient(file, "nebula-avatars");
export const uploadFileToCloudinary = uploadFileFromClient;
export const uploadMultipleFilesToCloudinary = uploadMultipleFilesFromClient;
