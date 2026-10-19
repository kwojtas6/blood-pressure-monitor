import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges conditional class names (clsx) and resolves Tailwind class
 * conflicts (tailwind-merge). Standard shadcn/ui helper, used by the
 * primitives in `src/components/ui/`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
