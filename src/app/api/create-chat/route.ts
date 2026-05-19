
import { NextRequest,NextResponse } from "next/server";
export async function POST (req:NextRequest){
    try {
        const body = await req.json();
        const {fileUrl}=body;
        return NextResponse.json({message:"chat created successfully",fileUrl},{status:201});  
    } catch (error) {
       return NextResponse.json({
            message : "Internal Server Error",
        },{status:500})
    }
}