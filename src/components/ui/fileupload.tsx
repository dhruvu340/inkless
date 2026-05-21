"use client";

import React, { useState } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


interface UploadedData {
  fileUrl: string;
  fileKey: string;
  fileName: string;
}

const Fileupload = () => {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
      fileUrl,
    }: {
      fileKey: string;
      fileName: string;
      fileUrl: string;
    }) => {
      

      const response = await axios.post("/api/create-chat", {
        fileKey,
        fileName,
        fileUrl, 
      });

      
      return response.data;
    },
    onSuccess: ({chat_id}) => {
     toast.success("chat created successfully");
     router.push(`/chat/${chat_id}`);
    },
    onError: (error: any) => {
     
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Error creating chat";
        console.log(errorMessage);
        
      toast.error(`error while creating the chat`);
    },
  });

  const [loading, setLoading] = useState(false);

  const uploadFile = async (file: File): Promise<UploadedData> => {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const body = await response.json();
    const { uploadUrl, fileUrl, fileKey, fileName } = body;

    

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("S3 upload failed");
    }

    

    return {
      fileUrl,
      fileKey,
      fileName,
    };
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: loading || isPending,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (!file) {
        toast.error("Please upload a file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }

      try {
        setLoading(true);
        

       
        const uploadedData = await uploadFile(file);

        if (!uploadedData.fileKey || !uploadedData.fileName) {
          toast.error("Failed to upload file to S3");
          return;
        }

        
        mutate({
          fileKey: uploadedData.fileKey,
          fileName: uploadedData.fileName,
          fileUrl: uploadedData.fileUrl, 
        });
      } catch (error) {
       
        const errorMsg =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(errorMsg);
       
      }finally{
       setLoading(false);
      }
    },
  });

  const isProcessing = loading || isPending;

  return (
    <div className="p-3 bg-white rounded-xl">
      <div
        {...getRootProps({
          className: `
            border-dashed
            border-2
            rounded-xl
            cursor-pointer
            bg-gray-50
            py-8
            px-4
            flex
            justify-center
            items-center
            flex-col
            transition
            hover:bg-gray-100
            ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}
          `,
        })}
      >
        <input {...getInputProps()} disabled={isProcessing} />

        {isProcessing ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              {loading ? "Uploading PDF..." : "Processing PDF..."}
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
            <p className="mt-1 text-xs text-slate-500">
              or click to select (Max 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Fileupload;