import Header from '@/components/home/Header';
import Image from "next/image";
import { currentUser } from '@clerk/nextjs/server';
import { User } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;
  if (isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <main className="sm:p-7 sm:pb-0">
      <Header />
      {/* <h2 className="text-center max-w-[867px] pb-5 sm:pb-7 text-[52px] sm:text-[100px] leading-[39.5px] tracking-[-1.04px] sm:leading-[75px] sm:tracking-[-2.74px] mx-auto sm:mt-12 mt-10">
        Chat with PDFs from your dataroom
      </h2>
      <p className="text-xl sm:text-2xl pb-10 sm:pb-8 leading-[19px] sm:leading-[34.5px] w-[232px] sm:w-full tracking-[-0.4px] sm:tracking-[-0.6px] text-center mx-auto">
        Powerful due diligence at your fingertips
      </p> */}
    </main>
  );
}
