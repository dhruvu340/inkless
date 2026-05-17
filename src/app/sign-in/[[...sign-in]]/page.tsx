import { SignIn } from "@clerk/nextjs"

export default function Page(){
    return (
        <div className="min-h-screen w-screen bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900 ">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <SignIn/>
            </div>
        </div>
    )
}