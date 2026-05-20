

import {Pinecone} from "@pinecone-database/pinecone"
import {Document,RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter"
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pc.index({name:process.env.PINECONE_INDEX!});

type PdfPage = {
    pageContent:string,
    metadata:{
        loc:{pageNumber:number}
    }
}
export async function loadS3IntoPinecone(fileKey:string){
    console.log("downloading the file from s3");
    const fileName=await downloadFromS3(fileKey);
    if (!fileName) {
    throw new Error("could not download from s3");
  }
    const loader = new PDFLoader(fileName);
    const pages = (await loader.load()) as PdfPage[];
    const documents = await Promise.all(pages.map(prepareDocument));
    return documents;
}

export const truncateByteByByte=(str:string,bytes:number)=>{
const enc = new TextEncoder;
return new TextDecoder("utf-8").decode(enc.encode(str).slice(0,bytes));
}
async function prepareDocument(page:PdfPage){
    let {pageContent,metadata} = page;
    pageContent = pageContent.replace(/\n/g,"");
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata : {
                pageNumber:metadata.loc.pageNumber,
                text : truncateByteByByte(pageContent,36000),
            }
        })
    ])

    return docs
}
