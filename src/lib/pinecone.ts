import {
  Pinecone,
  PineconeRecord,
} from "@pinecone-database/pinecone";

import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import md5 from "md5";

import { downloadFromS3 } from "./s3-server";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pc.index({
  name: process.env.PINECONE_INDEX!,
});

type PdfPage = {
  pageContent: string;

  metadata: {
    loc: {
      pageNumber: number;
    };
  };
};

export async function loadS3IntoPinecone(
  fileKey: string
) {
  try {
    console.log(
      "Downloading PDF from S3..."
    );

    const fileName =
      await downloadFromS3(fileKey);

    if (!fileName) {
      throw new Error(
        "Could not download file from S3"
      );
    }

    console.log(
      "Loading PDF with Langchain..."
    );

    const loader = new PDFLoader(fileName);

    const pages =
      (await loader.load()) as PdfPage[];

    console.log(
      `Loaded ${pages.length} pages`
    );

    const documents =
      await Promise.all(
        pages.map((page) =>
          prepareDocument(page)
        )
      );

    const flatDocs = documents.flat();

    console.log(
      `Prepared ${flatDocs.length} chunks`
    );

    const vectors = (
      await Promise.all(
        flatDocs.map((doc) =>
          embedDocuments(doc)
        )
      )
    ).filter(Boolean);

    console.log(
      `Generated ${vectors.length} embeddings`
    );

    const namespace =
      convertToAscii(fileKey);

    const batchSize = 100;

    for (
      let i = 0;
      i < vectors.length;
      i += batchSize
    ) {
      const batch = vectors.slice(
        i,
        i + batchSize
      );

      await index
        .namespace(namespace)
        .upsert({records:batch});

      console.log(
        `Uploaded batch ${
          i / batchSize + 1
        }`
      );
    }

    console.log(
      "Completed loading PDF into Pinecone"
    );

    return documents[0];
  } catch (error) {
    console.log(
      "Error loading PDF into Pinecone",
      error
    );

    throw error;
  }
}

export async function embedDocuments(
  doc: Document
): Promise<
  PineconeRecord<{
    text: string;
    pageNumber: number;
  }>
> {
  try {
    const embeddings =
      await getEmbeddings(
        doc.pageContent
      );

    const hash = md5(
      JSON.stringify(doc.metadata) +
        doc.pageContent
    );

    return {
      id: hash,

      values: embeddings,

      metadata: {
        text: String(
          doc.pageContent
        ),

        pageNumber: Number(
          doc.metadata.pageNumber
        ),
      },
    };
  } catch (error) {
    console.log(
      "Error embedding document",
      error
    );

    throw error;
  }
}

export const truncateByteByByte = (
  str: string,
  bytes: number
) => {
  const enc = new TextEncoder();

  return new TextDecoder(
    "utf-8"
  ).decode(
    enc.encode(str).slice(0, bytes)
  );
};

async function prepareDocument(
  page: PdfPage
) {
  let { pageContent, metadata } =
    page;

  
  pageContent = pageContent.replace(
    /\n/g,
    " "
  );

  
  pageContent = pageContent.replace(
    /\s+/g,
    " "
  );

  const splitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 500,

      chunkOverlap: 50,
    });

  const docs =
    await splitter.splitDocuments([
      new Document({
        pageContent,

        metadata: {
          pageNumber:
            metadata.loc.pageNumber,

          text: truncateByteByByte(
            pageContent,
            36000
          ),
        },
      }),
    ]);

  return docs;
}