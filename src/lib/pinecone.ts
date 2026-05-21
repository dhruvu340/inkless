

import {Pinecone} from "@pinecone-database/pinecone"
import {Document,RecursiveCharacterTextSplitter} from "@pinecone-database/doc-splitter"
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { getEmbeddings } from "./embeddings";
import { Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data";
import md5 from "md5"

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
    const vectors = await Promise.all(documents.flat().map(embedDocuments));
}
export async function embedDocuments(doc:Document){
    try {
        const embeddings=await getEmbeddings(doc.pageContent);
        const hash = md5(doc.pageContent);
        return {
            id : hash,
            values:embeddings,
            metadata:{
                text:doc.metadata.text,
                pageNumber:doc.metadata.pageNumber,
            }
        } as Vector;
    } catch (error) {
        console.log("error embedding document",error);
        throw error;
    }
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
