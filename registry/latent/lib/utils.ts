import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
