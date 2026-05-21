"use client";

import { Input } from "./input";
import { Message, useChat } from "ai/react";
import { Button } from "./button";
import { Loader2, Send } from "lucide-react";
import MessageList from "./messageList";
import { useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Props = {
  chatId: number;
};

const Chat = ({ chatId }: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);


  const { data: initialMessages = [], isLoading: isLoadingInitial } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      try {
        const response = await axios.post<Message[]>("/api/get-messages", {
          chatId,
        });
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const {
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    messages,
    isLoading,
    error,
  } = useChat({
    api: "/api/chatwithai",
    body: { chatId },
    initialMessages,
  });

  
  const lastMessage = useMemo(
    () => messages[messages.length - 1],
    [messages.length, messages]
  );

  
  const showLoader = useMemo(
    () => isLoading && lastMessage?.role === "user",
    [isLoading, lastMessage?.role]
  );


  useEffect(() => {
    if (!messages.length) return;

  
    const scrollTimer = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    return () => cancelAnimationFrame(scrollTimer);
  }, [messages.length]);

 
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (!input.trim() || isLoading || isLoadingInitial) {
        return;
      }

      try {
        await originalHandleSubmit(e);
      } catch (err) {
        console.error("Submit error:", err);
      }
    },
    [input, isLoading, isLoadingInitial, originalHandleSubmit]
  );

  const displayMessages = useMemo(
    () => messages.length > 0 ? messages : initialMessages,
    [messages.length, messages, initialMessages]
  );

  const isEmpty = displayMessages.length === 0 && !isLoadingInitial;

  return (
    <div className="relative h-full w-full flex flex-col bg-gradient-to-b from-[#0a0f1c] to-[#0e1628] text-white overflow-hidden">
    
      <div className="h-16 flex-shrink-0 px-4 sm:px-6 py-4 border-b border-[#1c2a3a] bg-[#0e1628] flex items-center">
        <h1 className="font-semibold text-base sm:text-lg text-blue-300">
          Chat
        </h1>
      </div>

   
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 space-y-3 scrollbar-hide"
      >
        {isLoadingInitial ? (
          
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 text-blue-400 animate-spin mx-auto" />
              <p className="text-xs text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : isEmpty ? (
        
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-[#1c2a3a] flex items-center justify-center mx-auto">
                <Send className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Start a conversation</p>
                <p className="text-xs text-gray-500 mt-1">Ask questions about your document</p>
              </div>
            </div>
          </div>
        ) : (
        
          <>
            <MessageList messages={displayMessages} />

          
            {showLoader && (
              <div className="flex justify-start pl-0 pr-3 sm:pr-4">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-[#0e1628] border border-[#1c2a3a] shadow-md flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
          </>
        )}

        
        <div ref={messagesEndRef} className="h-0" />
      </div>

      
      {error && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-2 bg-red-950/40 border-t border-red-800/30 text-red-400 text-xs">
          <p>{error?.message || "Something went wrong. Please try again."}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c] to-transparent border-t border-[#1c2a3a]/50"
      >
        <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#1c2a3a] bg-[#0e1628] p-2.5 sm:p-3 shadow-lg hover:border-[#2a3a4a] transition-colors duration-200">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            disabled={isLoading || isLoadingInitial}
            maxLength={500}
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-gray-500 disabled:opacity-50 transition-opacity"
            onKeyDown={(e) => {
              
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />

          <Button
            type="submit"
            disabled={isLoading || isLoadingInitial || !input.trim()}
            className="h-9 w-9 sm:h-11 sm:w-11 cursor-pointer rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-40 transition-all duration-200 flex items-center justify-center flex-shrink-0 active:scale-95"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>

     
        {input.length > 400 && (
          <p className="text-xs text-gray-500 mt-1">
            {500 - input.length} characters remaining
          </p>
        )}
      </form>
    </div>
  );
};

export default Chat;