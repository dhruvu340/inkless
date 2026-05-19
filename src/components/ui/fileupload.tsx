"use client";

import React, { useState } from "react";

import { Inbox, Loader2 } from "lucide-react";

import { useDropzone } from "react-dropzone";

import { toast } from "sonner";

const Fileupload = () => {

  const [loading, setLoading] =
    useState(false);

  const uploadFile = async (file: File) => {

  
    const response = await fetch(
      "/api/upload",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to get upload URL"
      );
    }

    const { uploadUrl, fileUrl } =
      await response.json();

    
    const uploadResponse = await fetch(
      uploadUrl,
      {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(
        "S3 upload failed"
      );
    }

    return fileUrl;
  };

  const {
    getRootProps,
    getInputProps,
  } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },

    maxFiles: 1,

    onDrop: async (acceptedFiles) => {

      const file = acceptedFiles[0];

      if (!file) return;

      try {

        setLoading(true);

        const uploadedUrl =
          await uploadFile(file);

        

        toast.success(
          "PDF uploaded successfully"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Upload failed"
        );

      } finally {

        setLoading(false);
      }
    },
  });

  return (
    <div className="p-3 bg-white rounded-xl">

      <div
        {...getRootProps({
          className:
            `
            border-dashed
            border-2
            rounded-xl
            cursor-pointer
            bg-gray-50
            py-8
            flex
            justify-center
            items-center
            flex-col
            transition
            hover:bg-gray-100
          `,
        })}
      >

        <input {...getInputProps()} />

        {loading ? (
          <>
            <Loader2
              className="
                w-10
                h-10
                text-blue-500
                animate-spin
              "
            />

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              Uploading PDF...
            </p>
          </>
        ) : (
          <>
            <Inbox
              className="
                w-10
                h-10
                text-blue-500
              "
            />

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              Drop PDF Here
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Fileupload;