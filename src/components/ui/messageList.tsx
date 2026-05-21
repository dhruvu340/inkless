"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Props = {
  messages: Message[];
};


const MessageItem = memo(({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex w-full", {
        "justify-end": isUser,
        "justify-start": !isUser,
      })}
    >
      <div
        className={cn(
          "rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm leading-relaxed max-w-[90%] sm:max-w-[75%]",
          {
            "bg-slate-700 text-slate-50 rounded-br-none": isUser,
            "bg-slate-800/50 text-slate-100 rounded-bl-none": !isUser,
          }
        )}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              [
                rehypeKatex,
                {
                  output: "mathml",
                  trust: true,
                },
              ],
            ]}
            components={{
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-1">{children}</ol>,
              li: ({ children }) => <li className="text-xs sm:text-sm">{children}</li>,
              code: ({ inline, children }: any) => 
                inline ? (
                  <code className="bg-slate-900/60 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                ) : (
                  <code className="block bg-slate-900/60 text-slate-100 p-2 rounded text-xs font-mono overflow-x-auto my-1">{children}</code>
                ),
              pre: ({ children }) => (
                <pre className="bg-slate-900/60 p-2 rounded overflow-x-auto text-xs my-1">{children}</pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-2 italic text-slate-300 my-1 text-xs">{children}</blockquote>
              ),
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs">
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-1">
                  <table className="text-xs border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-slate-900/40">{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr className="border-b border-slate-700/30">{children}</tr>,
              th: ({ children }) => <th className="px-1 py-0.5 text-left text-blue-300 font-semibold">{children}</th>,
              td: ({ children }) => <td className="px-1 py-0.5 text-slate-200">{children}</td>,
              strong: ({ children }) => <strong className="font-bold text-slate-100">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              hr: () => <hr className="my-1 border-slate-700/30" />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

const MessageList = ({ messages }: Props) => {
  if (!messages?.length) return null;

  return (
    <div className="flex flex-col gap-2 px-2 sm:px-3 py-4 overflow-hidden">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default memo(MessageList);