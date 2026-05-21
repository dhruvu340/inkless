"use client";

import { chats, DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "./button";
import {
  Menu,
  MessageCircle,
  PlusCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({
  chats,
  chatId,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
     
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 px-4 flex items-center justify-between bg-gradient-to-r from-slate-950 via-blue-950/30 to-slate-950 backdrop-blur-lg border-b border-blue-400/10 shadow-lg shadow-blue-500/5">
        <button
          onClick={() => setOpen(true)}
          className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20 transition-all duration-300 active:scale-95"
        >
          <Menu className="w-5 h-5 text-blue-300" />
        </button>

        <h1 className="text-base font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
          Inkless AI
        </h1>

        <div className="w-9" />
      </div>

     
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-gradient-to-b from-black/40 to-blue-950/30 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

     
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[280px] bg-gradient-to-b from-slate-900/80 via-blue-950/40 to-slate-950/60 backdrop-blur-2xl border-r border-blue-400/15 p-4 flex flex-col justify-between transition-all duration-500 overflow-y-auto overflow-x-hidden shadow-2xl shadow-blue-950/40 lg:translate-x-0 lg:static lg:w-full lg:rounded-none lg:shadow-none",
          {
            "translate-x-0": open,
            "-translate-x-full": !open,
          }
        )}
      >
        <div className="space-y-4">
        
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-white font-semibold text-lg">Chats</h2>

            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-blue-500/20 transition-all duration-300 active:scale-95"
            >
              <X className="w-5 h-5 text-blue-300" />
            </button>
          </div>

          <Link href="/">
            <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 cursor-pointer hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 border border-blue-400/20 hover:shadow-blue-500/50 flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" />
              New Chat
            </Button>
          </Link>

          <div className="mt-8 flex flex-col gap-5">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                onClick={() => setOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all duration-300 group cursor-pointer",
                    {
                      "bg-gradient-to-r from-blue-600/80 to-blue-500/60 text-white border-blue-400/30 shadow-lg shadow-blue-500/25":
                        chat.id === chatId,
                      "bg-slate-800/40 border-slate-700/30 text-slate-300 hover:bg-slate-700/50 hover:border-blue-400/20 hover:text-blue-100 active:bg-slate-700/70":
                        chat.id !== chatId,
                    }
                  )}
                >
                  <MessageCircle className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <p className="truncate whitespace-nowrap text-sm font-medium">
                    {chat.pdfName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-5 border-t border-blue-400/10 space-y-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Link href="/" className="hover:text-blue-300 transition-colors duration-300 font-medium">
              Home
            </Link>

            <div className="w-1 h-1 rounded-full bg-slate-600" />

            <Link href="/" className="hover:text-blue-300 transition-colors duration-300 font-medium">
              Source
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSideBar;