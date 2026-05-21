import { getEmbeddings } from "./embeddings";
import { index } from "./pinecone";
import { convertToAscii } from "./utils";

type MetaData = {
  text?: string;
  pageNumber?: number;
};

export async function getMatches(embeddings: number[], fileKey: string) {
  try {
    const namespace = convertToAscii(fileKey);

    const result = await index.query({
      vector: embeddings,
      topK: 8,
      includeMetadata: true,
      namespace,
    });

    return result.matches ?? [];
  } catch (error) {
    console.error("Pinecone error:", error);
    return [];
  }
}

export async function getContext(query: string, fileKey: string) {
  try {
    if (!query?.trim()) return "";

    const queryEmbeddings = await getEmbeddings(query);

    const matches = await getMatches(queryEmbeddings, fileKey);

    if (!matches.length) return "";

    // 🔥 DO NOT over-filter (this was your main bug)
    const topMatches = matches
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 6);

    const docs = topMatches
      .map((m) => (m.metadata as MetaData)?.text)
      .filter(Boolean);

    const context = docs
      .map((d, i) => `Chunk ${i + 1}:\n${d}`)
      .join("\n\n");

    return context.slice(0, 3000);
  } catch (error) {
    console.error("Context error:", error);
    return "";
  }
}