import { memo } from 'react';
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
}

function Card({ className, children, title, description }: ICardProps) {
  return (
    <CardRoot className={cn('w-full', className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </CardRoot>
  );
}

export default memo(Card);
