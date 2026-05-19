import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { format } from "date-fns"

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return format(date, "MMMM dd, yyyy")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
