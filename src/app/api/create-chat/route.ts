import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { Document } from "langchain/document";
export interface ResponseType {
  message: string;
  error?: string;
  success: string;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  pages?:Document<Record<string, any>>[],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { fileUrl, fileKey, fileName } = body;

    if (!fileKey) {
      return NextResponse.json(
        {
          message: "Missing fileKey",
          error: "fileKey is required",
          success: false,
        },
        { status: 400 },
      );
    }

    if (!fileName) {
      return NextResponse.json(
        {
          message: "Missing fileName",
          error: "fileName is required",
          success: false,
        },
        { status: 400 },
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        {
          message: "Missing fileUrl",
          error: "fileUrl is required",
          success: false,
        },
        { status: 400 },
      );
    }

    const pages = await loadS3IntoPinecone(fileKey);

    const responseData = {
      message: "Chat created successfully",
      success: true,
      fileUrl,
      fileKey,
      fileName,
      pages,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    );
  }
}
