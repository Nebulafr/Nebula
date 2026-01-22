"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadImageFromClient } from "@/lib/cloudinary";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ImageUpload({
  images,
  onImagesChange,
  onNext,
  onBack,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadImageFromClient(file, "nebula-events"),
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Upload Event Images</h3>
        <p className="text-sm text-muted-foreground">
          Add images to showcase your social event
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="images">Event Images</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={uploading}
          />
          {uploading && (
            <p className="text-sm text-muted-foreground mt-2">
              Uploading images...
            </p>
          )}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {images.map((imageUrl: string, index: number) => (
              <div key={index} className="relative">
                <img
                  src={imageUrl}
                  alt={`Event image ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
