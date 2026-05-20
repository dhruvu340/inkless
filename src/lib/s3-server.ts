import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3";
import fs from "fs";
import path from "path"

export async function downloadFromS3(fileKey:string){
   try{ const command = new GetObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:fileKey,
    })
    const response = await s3.send(command);
     

  const tmpDir = "/tmp";

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  const filePath = path.join(tmpDir, `${Date.now()}.pdf`);

  const byteArray = await response.Body?.transformToByteArray();

  fs.writeFileSync(filePath, Buffer.from(byteArray!));

  return filePath;}
  catch(err){
    console.log("error in the s3-server"); 
    
  }
}