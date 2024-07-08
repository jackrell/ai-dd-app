import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  isMobile?: boolean;
}

const Logo = ({ isMobile }: LogoProps) => {
  return (
    <div className="flex items-center">
      <Image
        src="/logo.png"
        alt="Logo"
        width={isMobile ? 21 : 30}
        height={isMobile ? 25 : 34}
        className="mt-1"
      />
      {!isMobile && (
        <h1 className="shadows text-primary text-[32px] sm:text-[35px] ml-2">
          Dataroom Chat
        </h1>
      )}
    </div>
  );
};

export default Logo;
