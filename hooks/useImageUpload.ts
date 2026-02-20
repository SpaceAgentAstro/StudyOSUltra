import React from 'react';
import { useState } from 'react';
import { readFile } from '../utils';

interface UseImageUploadResult {
  isUploading: boolean;
  uploadProgress: number;
  imageAttachment: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearAttachment: () => void;
  setImageAttachment: (image: string | null) => void;
}

export const useImageUpload = (): UseImageUploadResult => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress for visual feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 95));
      }, 50);

      try {
        const result = await readFile(file, 'dataURL');

        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
            setImageAttachment(result as string);
            setIsUploading(false);
            setUploadProgress(0);
        }, 500);
      } catch (error) {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        console.error("Upload failed", error);
      }
    }
  };

  const clearAttachment = () => {
    setImageAttachment(null);
  };

  return {
    isUploading,
    uploadProgress,
    imageAttachment,
    handleImageUpload,
    clearAttachment,
    setImageAttachment
  };
};
