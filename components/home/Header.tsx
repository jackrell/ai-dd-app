'use client';
import { useState } from 'react';
import Logo from '../ui/Logo'; // Adjust the import path as needed
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="container hidden bg-white w-full px-5 h-[78px] sm:flex justify-between items-center border shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] rounded-[30px] border-solid border-[rgba(0,0,0,0.17)] mx-auto">
        <Link href="/" className="flex items-center">
          <Logo />
          <span className="text-2xl font-bold ml-2">Add Logo</span>
        </Link>
        <div className="sm:flex gap-4 items-center">
          <Link
            href="/sign-in"
            className="text-primary py-1.5 px-[22px] text-center text-xl font-normal border rounded-[18px] border-solid border-primary "
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="sm:hidden bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border-b-[0.5px] h-[54px] flex justify-between items-center px-6 border-b-white border-solid">
        <Link href="/" className="flex items-center">
          <Logo isMobile={true} />
          <span className="text-xl font-bold ml-2">Your Logo</span>
        </Link>
        <div className="flex justify-center items-baseline">
          <Image
            src="/align-justify.svg"
            onClick={() => setOpen((i) => !i)}
            alt="Menu"
            width={20}
            height={20}
            className="cursor-pointer"
          />
        </div>
      </div>
      {open ? (
        <div className="flex sm:hidden gap-4 items-center py-3 bg-white shadow px-5">
          <Link
            href="/sign-in"
            className="text-primary py-1 px-[22px] text-center text-lg font-normal border rounded-[18px] border-solid border-primary "
          >
            Log in
          </Link>
        </div>
      ) : null}
    </>
  );
};

export default Header;
