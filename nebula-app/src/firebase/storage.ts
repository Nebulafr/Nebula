import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./client";

export const uploadFile = async (
  file: File,
  targetDir: string,
  targetId: string
): Promise<string> => {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${targetId}-${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `${targetDir}/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

export const deleteFile = async (fileUrl: string) => {
  const fileRef = ref(storage, fileUrl);
  return await deleteObject(fileRef);
};
