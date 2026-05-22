import { Button } from "@/components/ui/button";
import Fileupload from "@/components/ui/fileupload";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r overflow-x-hidden from-blue-700 via-blue-800 to-gray-900 px-4">
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center text-center w-full max-w-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <h1 className="text-3xl sm:text-5xl text-white font-semibold">
              Chat With Any PDF
            </h1>
            <UserButton />
          </div>

          <div className="flex justify-between items-center mt-5">
            {isAuth && (
              <Button className="font-medium cursor-pointer text-white p-6 text-lg">
                Go to Chats
              </Button>
            )}
          </div>

          <p className="max-w-xl mt-4 text-blue-200 text-sm sm:text-base">
            Turn dense documents into interactive conversations. Inkless lets
            you upload any PDF and instantly get answers, summaries, and
            insights using powerful AI. It’s like having a personal assistant
            who has memorized every page.
          </p>

          <div className="w-full mt-4 flex justify-center">
            {isAuth ? (
              <Fileupload />
            ) : (
              <Link href="/sign-in">
                <Button className="text-lg sm:text-xl p-6 cursor-pointer">
                  Login in to Get Started
                  <LogIn className="ml-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}