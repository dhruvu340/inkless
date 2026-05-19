import { Pinecone } from '@pinecone-database/pinecone';
export const pc = new Pinecone({ apiKey: process.env.PINECONE_API!});
export const index = pc.index({name : process.env.PINECODE_INDEX!});


// download and read from S3

