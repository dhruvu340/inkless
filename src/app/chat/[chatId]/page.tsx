import ChatSideBar from "@/components/ui/chatSideBar";
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

  return (
    <div
      className="
      flex
      h-screen
      overflow-hidden
      bg-[#020617]
      text-white
    "
    >
      <div
        className="
        flex
        w-full
        h-screen
        overflow-hidden
        flex-col
        lg:flex-row
      "
      >
        <div
          className="
          w-full
          lg:w-[320px]
          lg:min-w-[320px]
          border-b
          lg:border-b-0
          lg:border-r
          border-blue-500/20
        "
        >
          <ChatSideBar
            chatId={parseInt(chatId)}
            chats={_chats}
          />
        </div>

        <div
          className="
          flex-1
          overflow-y-auto
          p-4
          sm:p-6
          bg-gradient-to-br
          from-[#020617]
          via-[#071120]
          to-[#0f172a]
        "
        >
          <div
            className="
            w-full
            h-full
            rounded-3xl
            border
            border-blue-500/20
            bg-white/5
            backdrop-blur-xl
            shadow-[0_0_40px_rgba(59,130,246,0.12)]
          "
          />
        </div>

        <div
          className="
          hidden
          xl:block
          xl:w-[380px]
          border-l
          border-blue-500/20
          bg-[#050b18]
          backdrop-blur-xl
        "
        />
      </div>
    </div>
  );
};

export default Page;