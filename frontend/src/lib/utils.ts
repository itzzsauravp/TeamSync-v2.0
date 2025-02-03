import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateAndTime = (time) => {
  const date = new Date(time);
  const sentAtTime = `${
    date.getHours() > 12 ? date.getHours() - 12 : date.getHours()
  } : ${date.getMinutes()} ${date.getHours() > 12 ? "PM" : "AM"}`;
  return sentAtTime;
};
export const captalizeUserName = (username: string) => {
  const firstLetter = username[0].toUpperCase();
  const restLetters = username.slice(1);
  return firstLetter.concat(restLetters);
};
