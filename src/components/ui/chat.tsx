"use client";

import { Input } from "./input";
import { useChat } from "ai/react";
import { Button } from "./button";
import { Send } from "lucide-react";
import MessageList from "./messageList";
import { useEffect, useRef } from "react";

type Props = {
  chatId: number;
};

const Chat = ({ chatId }: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading,
    error,
  } = useChat({
    api: "/api/chatwithai",
    body: { chatId },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative h-full w-full flex flex-col">

      {/* HEADER */}
      <div className="shrink-0 p-6">
        <h1 className="font-bold text-xl">Chat</h1>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <MessageList messages={messages} />
        <div ref={scrollRef} />
      </div>

      {error && (
        <div className="text-red-500 text-sm px-4">
          Something went wrong. Please try again.
        </div>
      )}

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="absolute bottom-0 left-0 right-0 p-4"
      >
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-lg">

          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-white h-12 px-4"
          />

          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </form>

    </div>
  );
};

export default Chat;