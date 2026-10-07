import { memo } from 'react';
import HeroImage from '../HeroImage';

type PageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IPageProps {
  actionButton?: React.ReactNode;
  children: React.ReactNode;
  heroImageUrl?: string;
  size?: PageSize;
  title?: React.ReactNode;
  titleActions?: React.ReactNode;
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

function Page({ actionButton, children, heroImageUrl, size = '2xl', title, titleActions }: IPageProps) {
  const maxWidth = getPageMaxWidth(size);
  const titleContent = typeof title === 'string'
    ? <h1 className="min-w-0 truncate text-xl font-bold">{title}</h1>
    : title;

  return (
    <div className='flex flex-col flex-1 items-center w-full h-full'>
      {heroImageUrl && <HeroImage actionButton={actionButton} imageUrl={heroImageUrl} />}
      <div className={`flex flex-col flex-1 w-full h-full ${maxWidth} p-4 lg:px-24 lg:py-12`}>
        <div className="flex flex-col flex-1 gap-4 w-full bg-background">
          {(titleContent || titleActions) && (
            <div className="flex w-full min-w-0 items-center justify-between gap-3">
              <div className="min-w-0 flex-1">{titleContent}</div>
              {titleActions && (
                <div className="flex shrink-0 items-center gap-2">{titleActions}</div>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export default memo(Page);
