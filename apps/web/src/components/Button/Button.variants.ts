import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md',
        outline: 'border-2 border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        subtle: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md',
      },
      size: {
        default: 'h-11 px-4 py-2 text-sm',
        sm: 'h-8 px-3 py-1 text-xs',
        lg: 'h-12 px-6 py-3 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
