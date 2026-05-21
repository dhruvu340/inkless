import ChatSideBar from "@/components/ui/chatSideBar";
import PdfViewer from "@/components/ui/pdfViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    chatId: string;
  }>;
};

const Page = async ({
  params,
}: Props) => {
  const { chatId } = await params;

  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId));

  if (!_chats) {
    return redirect("/");
  }

  if(!_chats.find((chat)=>chat.id===parseInt(chatId))){
    return redirect("/");
  }

  const currChat=_chats.find((chat)=>chat.id===parseInt(chatId));

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex w-full h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[280px] shrink-0 border-r border-slate-700/30 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900">
          <ChatSideBar
            chatId={parseInt(chatId)}
            chats={_chats}
          />
        </div>

      
        <div className="lg:hidden">
          <ChatSideBar
            chatId={parseInt(chatId)}
            chats={_chats}
          />
        </div>

       
        <div className="flex-1 overflow-y-auto pt-20 lg:pt-6 px-3 sm:px-6 lg:px-6 pb-6 bg-gradient-to-br from-slate-950 via-slate-900/30 to-slate-950 min-w-0">
          <div className="w-full h-full rounded-2xl lg:rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-800/30 via-slate-900/20 to-slate-800/30 backdrop-blur-xl shadow-2xl shadow-slate-950/60 overflow-hidden transition-all duration-500 hover:border-slate-600/50 hover:shadow-slate-950/80" />
        </div>

       
        <div className="hidden lg:flex flex-[1.2] min-w-[400px] max-w-[550px] border-l border-slate-700/30 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900 overflow-hidden transition-all duration-300">
          <div className="w-full h-full">
            <PdfViewer pdf_url={currChat?.pdfUrl||""}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;