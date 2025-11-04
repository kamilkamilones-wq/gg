
import React, { useState, useRef } from 'react';
import { UploadIcon, TrashIcon } from './IconComponents';

interface ImageUploaderProps {
  label: string;
  onFileSelect: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onFileSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div 
        onClick={handleContainerClick}
        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center text-gray-400 hover:border-indigo-500 hover:bg-gray-50 cursor-pointer transition-colors duration-200 relative group bg-white"
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {preview ? (
          <>
            <img src={preview} alt="Podgląd" className="h-full w-full object-contain p-1 rounded-md" />
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-opacity duration-200"
              aria-label="Usuń obraz"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <UploadIcon className="mx-auto h-8 w-8" />
            <p className="mt-1 text-sm">Kliknij, aby wgrać</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
