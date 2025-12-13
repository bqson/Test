'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Camera, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UploadedImage {
  url: string;
  caption: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  bucket?: string;
  maxImages?: number;
  singleImage?: boolean; // For single image like cover photo
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  bucket = 'images',
  maxImages = 10,
  singleImage = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const newImages: UploadedImage[] = [];
      const totalFiles = Math.min(files.length, maxImages - images.length);

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files');
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          // If storage bucket doesn't exist, use base64 fallback
          const base64Url = await fileToBase64(file);
          newImages.push({
            url: base64Url,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          });
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          newImages.push({
            url: urlData.publicUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          });
        }

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      if (singleImage && newImages.length > 0) {
        onChange([newImages[0]]);
      } else {
        onChange([...images, ...newImages]);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;

    const newImage: UploadedImage = {
      url: urlInput.trim(),
      caption: captionInput.trim() || '',
    };

    if (singleImage) {
      onChange([newImage]);
    } else {
      onChange([...images, newImage]);
    }

    setUrlInput('');
    setCaptionInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const newImages = [...images];
    newImages[index].caption = caption;
    onChange(newImages);
  };

  const canAddMore = singleImage ? images.length === 0 : images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div className="border-2 border-dashed border-input rounded-xl p-6 hover:border-destination/50 transition-colors bg-muted/30">
          {uploading ? (
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-destination animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              <div className="w-48 mx-auto bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-destination rounded-full h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center p-4 rounded-xl bg-destination/10 hover:bg-destination/20 transition-colors"
                >
                  <Camera className="w-8 h-8 text-destination mb-2" />
                  <span className="text-sm font-medium text-foreground">From Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="flex flex-col items-center p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <LinkIcon className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">From URL</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {singleImage ? 'Upload 1 image' : `Upload up to ${maxImages} images`} • Max 5MB each • JPG, PNG, GIF, WebP
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={!singleImage}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* URL Input Modal */}
      {showUrlInput && (
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Add image from URL</span>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(false);
                setUrlInput('');
                setCaptionInput('');
              }}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-destination bg-background text-foreground text-sm"
          />
          <input
            type="text"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder="Image caption (optional)"
            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-destination bg-background text-foreground text-sm"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="w-full px-4 py-2 bg-destination hover:bg-destination/90 disabled:bg-muted disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            Add Image
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${singleImage ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden bg-muted aspect-video"
            >
              <img
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMyIgeT0iMyIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiLz48cGF0aCBkPSJtMjEgMTUtMy4wODYtMy4wODZhMiAyIDAgMCAwLTIuODI4IDBMNiAyMSIvPjwvc3ZnPg==';
                }}
              />
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Caption Input */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="text"
                  value={image.caption}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  placeholder="Add caption..."
                  className="w-full px-2 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded text-white placeholder-white/60 text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                />
              </div>

              {/* Image number badge */}
              {!singleImage && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-white text-xs font-medium">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !canAddMore && (
        <div className="text-center py-6 bg-muted/30 rounded-xl">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No images added yet</p>
        </div>
      )}
    </div>
  );
};

// Simple single image uploader for cover photos
interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  placeholder?: string;
}

export const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({
  value,
  onChange,
  bucket = 'images',
  placeholder = 'Upload cover image',
}) => {
  const [images, setImages] = useState<UploadedImage[]>(
    value ? [{ url: value, caption: '' }] : []
  );

  const handleChange = (newImages: UploadedImage[]) => {
    setImages(newImages);
    onChange(newImages.length > 0 ? newImages[0].url : '');
  };

  return (
    <ImageUploader
      images={images}
      onChange={handleChange}
      bucket={bucket}
      singleImage={true}
      maxImages={1}
    />
  );
};

