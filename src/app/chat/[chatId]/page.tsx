

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import React from 'react'

type Props = {
    params:Promise<{chatId:string}>
    
}

const Page = async ({params }: Props) => { 
  const {chatId} = await params;
  const userId = await auth();
  if(!userId){
    return redirect("/sign-in");
  }
  
 
  return (
    <div>Page {chatId}</div>
  )
}

export default Page
