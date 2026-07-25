import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ hover, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${hover ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
