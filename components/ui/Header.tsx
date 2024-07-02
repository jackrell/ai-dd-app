import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { User, currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';

export default async function Header() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-40 bg-white w-full border-b border-b-slate-200 shadow-sm">
      <div className="h-16 py-4 container mx-auto">
        <nav className="flex justify-between mx-10 items-center">
          <Link
            href="/"
            className="hover:text-slate-600 cursor-pointer flex items-center"
          >
            <Image src="/logo.png" alt="Logo" width={24} height={26} />
            <span className="text-2xl ml-2 font-medium leading-none">Dataroom Chat</span>
          </Link>
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <Link href="/sign-in">Log in</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}