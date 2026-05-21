import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { getS3Url } from "@/utils/uploadToS3";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const { fileUrl, fileKey, fileName } = body;

    if (!fileKey) {
      return NextResponse.json(
        {
          error: "fileKey is required",
        },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        {
          error: "fileName is required",
        },
        { status: 400 }
      );
    }

    if (!fileUrl) {
      return NextResponse.json(
        {
          error: "fileUrl is required",
        },
        { status: 400 }
      );
    }

    await loadS3IntoPinecone(fileKey);

    const result = await db
      .insert(chats)
      .values({
        fileKey,
        pdfName: fileName,
        pdfUrl: getS3Url(fileKey),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    const chat_id = result[0].insertedId;

    return NextResponse.json(
      {
        success: true,
        chat_id,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred";

    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}