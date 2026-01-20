"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, ImageIcon } from "lucide-react"
import { CldUploadWidget } from 'next-cloudinary'

interface FileUploadProps {
  userId: string
  fileType: "certificate" | "profile" | "cover-photo"
  onUploadComplete?: (files: UploadedFile[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
}

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  url: string
  contentType: string
}

export default function FileUpload({
  userId,
  fileType,
  onUploadComplete,
  multiple = false,
  maxSize = 10,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleSuccess = (result: any) => {
    const info = result.info
    const newFile: UploadedFile = {
      id: info.public_id,
      filename: info.original_filename || info.public_id,
      originalName: info.original_filename || info.public_id,
      url: info.secure_url,
      contentType: `${info.resource_type}/${info.format}`,
    }

    const allFiles = multiple ? [...uploadedFiles, newFile] : [newFile]
    setUploadedFiles(allFiles)
    onUploadComplete?.(allFiles)
  }

  const removeFile = (fileId: string) => {
    const filtered = uploadedFiles.filter((f) => f.id !== fileId)
    setUploadedFiles(filtered)
    onUploadComplete?.(filtered)
  }

  const getFileIcon = (contentType: string) => {
    if (contentType?.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <CldUploadWidget 
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onSuccess={handleSuccess}
        options={ {
          multiple: multiple,
          maxFileSize: maxSize * 1024 * 1024,
          folder: `consultbook/${userId}/${fileType}`,
        } }
      >
        {({ open }) => (
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => open()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <Label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500">Click to upload {fileType}</span>
              </Label>
              <p className="text-xs text-gray-500">
                Max size: {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </CldUploadWidget>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.contentType)}
                <div>
                  <p className="text-sm font-medium">{file.originalName}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => removeFile(file.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
