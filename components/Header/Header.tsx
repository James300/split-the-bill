import { memo } from 'react';
import Link from 'next/link';
import { UserProfileButton } from '@/components/UserProfileButton';

function Header() {
  return (
    <header className="flex items-center justify-between w-full py-4 px-4 lg:px-24 max-w-screen-2xl mx-auto">
      <div className="flex items-center gap-4 w-full">
        <Link href="/">
          <h1 className="text-2xl font-bold h-[36px]">
            Split The Bill
          </h1>
        </Link>
      </div>
      <div className="hidden lg:flex items-center justify-end gap-8 w-full">
        <UserProfileButton />
      </div>
      <div className="flex lg:hidden items-center justify-end">
        <UserProfileButton />
      </div>
    </header>
  );
}

export default memo(Header);
