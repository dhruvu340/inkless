"use client";

import { Input } from "./input";
import { useChat } from "ai/react";
import { Button } from "./button";
import { Send } from "lucide-react";
import MessageList from "./messageList";

type Props = {};

const Chat = (props: Props) => {
  const { input, handleInputChange, handleSubmit, messages, isLoading } =
    useChat({
      api: "/api/chatwithai",
    });

  return (
    <div className="relative h-full w-full bg-transparent flex flex-col">

      {/* HEADER */}
      <div className="shrink-0 p-6">
        <h1 className="font-bold text-xl">Chat</h1>
      </div>

      {/* MESSAGES (SCROLL AREA) */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 scrollbar-hide">
        <MessageList messages={messages}  />
      </div>

      {/* INPUT (FIXED BOTTOM) */}
      <form
        onSubmit={handleSubmit}
        className="absolute bottom-0 left-0 right-0 p-4"
      >
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-lg">

          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-none outline-none text-base text-white lg:text-2xl font-medium placeholder:text-gray-500 h-12 px-4"
          />

          <Button
            type="submit"
            className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
          >
            <Send className="h-5 w-5 text-white" />
          </Button>

        </div>
      </form>

    </div>
  );
};

export default Chat;