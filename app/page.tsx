import Header from '@/components/home/Header';
import HowToUse from '@/components/home/HowToUse';
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
      <div className="mb-6">
        <Header />
      </div>
      <HowToUse />
    </main>
  );
}
