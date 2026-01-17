import { memo } from 'react';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ children, onClick, ...props }: IButtonProps) {
  return (
    <button
      {...props}
      className="
        rounded-xl cursor-pointer px-3 py-2
        bg-primary text-primary-foreground
        hover:bg-primary-hover
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default memo(Button);
