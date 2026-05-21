import { db } from "@/lib/db";
import { messages, chats } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";


const validateChatId = (chatId: unknown): chatId is number => {
  return typeof chatId === "number" && Number.isInteger(chatId) && chatId > 0;
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    const { chatId } = body as { chatId?: unknown };
    
    if (!validateChatId(chatId)) {
      return NextResponse.json(
        { error: "Invalid chatId. Must be a positive integer.", code: "INVALID_CHAT_ID" },
        { status: 400 }
      );
    }

   
    const chatResult = await db
      .select({ userId: chats.userId })
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);

    if (!chatResult || chatResult.length === 0) {
      return NextResponse.json(
        { error: "Chat not found", code: "CHAT_NOT_FOUND" },
        { status: 404 }
      );
    }

  
    if (chatResult[0].userId !== userId) {
      return NextResponse.json(
        { error: "Access denied", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

   
    const dbMessages = await db
      .select({
        id: messages.id,
        chatId: messages.chatId,
        content: messages.content,
        role: messages.role,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(100);

   
    const reversedMessages = dbMessages.reverse();

  
    const formattedMessages = reversedMessages.map((msg) => ({
      id: msg.id?.toString() || "",
      content: msg.content || "",
      role: (msg.role || "user") as "user" | "system",
      createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
    }));

   
    const cacheHeaders = {
      "Cache-Control": "private, max-age=60, s-maxage=60",
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    };

    
    return NextResponse.json(formattedMessages, {
      status: 200,
      headers: cacheHeaders,
    });
  } catch (error) {
    
    console.error("[GET-MESSAGES-ERROR]", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
};