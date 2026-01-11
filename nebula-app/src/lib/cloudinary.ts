export const uploadImageToCloudinary = async (
  file: File,
  folder: string = "nebula-events"
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};

export const uploadAvatarToCloudinary = async (file: File): Promise<string> => {
  return uploadImageToCloudinary(file, "nebula-avatars");
};

/**
 * Upload a file (document, PDF, PPT, etc.) to Cloudinary
 * @param file - The file to upload
 * @param folder - The folder in Cloudinary (default: "nebula-materials")
 * @returns The secure URL of the uploaded file
 */
export const uploadFileToCloudinary = async (
  file: File,
  folder: string = "nebula-materials"
): Promise<{ url: string; fileName: string; fileType: string; fileSize: number }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );
  formData.append("folder", folder);
  formData.append("resource_type", "auto"); // Allows any file type

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`File upload failed: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
};

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of files to upload
 * @param folder - The folder in Cloudinary
 * @returns Array of secure URLs
 */
export const uploadMultipleFilesToCloudinary = async (
  files: File[],
  folder: string = "nebula-materials"
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadFileToCloudinary(file, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results.map((result) => result.url);
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};
