"use client";

import { chats, DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "./button";
import {
  MessageCircle,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({
  chats,
  chatId,
}: Props) => {
  return (
    <div
      className="
      w-full
      h-screen
      p-4
      bg-[#0b1120]
      border-r
      border-blue-500/10
      overflow-y-auto
      text-white
    "
    >
      <Link href="/">
        <Button
          className="
          w-full
          h-12
          rounded-2xl
          bg-blue-600
          hover:bg-blue-500
          text-white
          font-medium
          transition-all
          duration-300
          shadow-[0_0_25px_rgba(37,99,235,0.35)]
          border
          border-blue-400/20
        "
        >
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      <div className="mt-6 flex flex-col gap-2">
        {chats.map((chat) => {
          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
            >
              <div
                className={cn(
                  `
                  flex
                  items-center
                  rounded-2xl
                  px-4
                  py-3
                  border
                  transition-all
                  duration-300
                  backdrop-blur-xl
                  `,
                  {
                    "bg-blue-600 text-white border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.35)]":
                      chat.id === chatId,

                    "bg-[#111827] border-transparent text-slate-300 hover:bg-[#172036] hover:border-blue-400/20 hover:text-white":
                      chat.id != chatId,
                  }
                )}
              >
                <MessageCircle className="mr-3 w-4 h-4 shrink-0" />

                <p
                  className="
                  truncate
                  whitespace-nowrap
                  text-sm
                  font-medium
                "
                >
                  {chat.pdfName}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div
        className="
        absolute bottom-12 left-15
        
        border-t-5
        border-blue-500/10
      "
      >
        <div
          className="
          flex
          items-center
          gap-4
          text-sm
          text-slate-400
        "
        >
          <Link
            className="
            hover:text-blue-400
            transition-colors
          "
            href="/"
          >
            Home
          </Link>

          <Link
            className="
            hover:text-blue-400
            transition-colors
          "
            href="/"
          >
            Source
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;