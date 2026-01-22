import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Card as CardRoot,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ICardProps {
  className?: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
  onClick?: () => void;
}

function Card({ className, children, title, description, onClick }: ICardProps) {
  return (
    <CardRoot className={cn('relative w-full hover:shadow-md hover:cursor-pointer', className)} onClick={onClick}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
      <div className="absolute flex items-center justify-center h-full top-0 right-4">
        <ChevronRight />
      </div>
    </CardRoot>
  );
}

export default memo(Card);
