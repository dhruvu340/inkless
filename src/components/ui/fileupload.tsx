"use client";

import React, { useState } from "react";

import { Inbox, Loader2 } from "lucide-react";

import { useDropzone } from "react-dropzone";
import axios from "axios"

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

const Fileupload = () => {
  const {mutate,isPending} = useMutation({
    mutationFn : async({fileKey,fileName} : {fileKey:string,fileName:string})=>{
      const response = await axios.post('api/create-chat',{
        fileKey,fileName
      })
      return response.data;
    }
  });

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
    const body =await response.json();

    const {uploadUrl,
    fileUrl,
    fileKey,
    fileName} = body;

    
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

    return {
    fileUrl,
    fileKey,
    fileName}
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

      if (!file) {
        toast.error("Please upload a file");
        return;
      }
      if(file.size>10*1024*1024){
        toast.error("Too Large Size File");
        return;
      }
      

      try {

        setLoading(true);

        const data =
          await uploadFile(file);
        if(!data.fileKey||!data.fileName){
            toast.error("Internal Server Error");
            return ;
          }
        
          
          mutate(data,{
            onSuccess : (data) => {
              toast.success(data.message);
            },
            onError:(err)=>{
              toast.error("error while creating chat");
            }
          });

      

      } catch (error) {
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

        {loading||isPending ? (
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