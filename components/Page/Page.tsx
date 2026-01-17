import { memo } from 'react';
import HeroImage from '../HeroImage';

type PageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IPageProps {
  actionButton?: React.ReactNode;
  children: React.ReactNode;
  heroImageUrl?: string;
  size?: PageSize;
}

function getPageMaxWidth(size: PageSize = '2xl') {
  switch (size) {
    case 'xs':
      return 'max-w-[480px]';
    case 'sm':
      return 'max-w-[672px]';
    case 'md':
      return 'max-w-[768px]';
    case 'lg':
      return 'max-w-[960px]';
    case 'xl':
      return 'max-w-[1280px]';
    case '2xl':
    default:
      return 'max-w-[1440px]';
  }
}

function Page({ actionButton, children, heroImageUrl, size = '2xl' }: IPageProps) {
  const maxWidth = getPageMaxWidth(size);

  return (
    <div className='flex flex-col items-center w-full h-full'>
      {heroImageUrl && <HeroImage actionButton={actionButton} imageUrl={heroImageUrl} />}
      <div className={`flex flex-col w-full h-full ${maxWidth} p-4 lg:px-24 lg:py-12`}>
        <div className="flex flex-col justify-center gap-4 w-full bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}

export default memo(Page);
