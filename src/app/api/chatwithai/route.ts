import { openai } from "@/lib/embeddings";
import { NextRequest } from "next/server";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getContext } from "@/lib/context";

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId } = await req.json();

    if (!chatId || !Array.isArray(messages)) {
      return new Response("Invalid request", { status: 400 });
    }

    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId));

    if (chat.length !== 1) {
      return new Response("Chat not found", { status: 404 });
    }

    const fileKey = chat[0].fileKey;

    const lastMessage = messages[messages.length - 1]?.content;
    if (!lastMessage) {
      return new Response("No message content", { status: 400 });
    }

    const context = await getContext(lastMessage, fileKey);

    const systemPrompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      dont answer the question outside the context
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      messages: [
        systemPrompt,
        ...messages
          .filter((m: Message) => m.role !== "system")
          .slice(-10),
      ],
      stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}