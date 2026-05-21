import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Props = {
  messages: Message[];
};

const MessageList = ({ messages }: Props) => {
  if (!messages?.length) return null;

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex w-full", {
            "justify-end": message.role === "user",
            "justify-start": message.role === "assistant",
          })}
        >
          <div
            className={cn(
              "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              {
                "bg-blue-600 text-white rounded-br-md":
                  message.role === "user",

                "bg-[#f7f7f8] text-gray-900 rounded-bl-md border border-gray-200":
                  message.role === "assistant",
              }
            )}
          >
            <div className="chat-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
