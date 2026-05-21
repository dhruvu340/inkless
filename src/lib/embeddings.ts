import {
  Configuration,
  OpenAIApi,
} from "openai-edge";

export const runtime = "edge";
const config = new Configuration({
  apiKey: process.env.OPENAI_SECRET,
  basePath:
    "https://openrouter.ai/api/v1",
});

export const openai = new OpenAIApi(config);

export async function getEmbeddings(
  text: string
) {
  try {
    const response =
      await openai.createEmbedding({
        model:
          "openai/text-embedding-3-small",
        input: text.replace(/\n/g, " "),
      });

    const result = await response.json();

    console.log(result);

    if (!response.ok) {
      throw new Error(
        result.error?.message ||
          "Embedding API failed"
      );
    }

    return result.data[0]
      .embedding as number[];
  } catch (error) {
    console.log(
      "error while calling the openrouter embeddings",
      error
    );

    throw error;
  }
}