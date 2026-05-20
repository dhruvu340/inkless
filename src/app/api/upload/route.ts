import { NextRequest, NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "@/lib/s3";


export async function POST(req: NextRequest) {

  const { fileName, fileType } = await req.json();

  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 300,
    }
  );

  const fileUrl =
    `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return NextResponse.json({
    uploadUrl,
    fileUrl,
    fileKey:key,
    fileName
  });
}