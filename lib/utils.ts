import { nameMap } from "@/constants/nameMap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getDeviconClassName = (name: string) => {
    const normalizeName = name.toLowerCase().replace(/[ .]/g, "");

    return nameMap[normalizeName]
        ? `${nameMap[normalizeName]} colored`
        : "devicon-devicon-plain";
};

export const getTimeStamp = (date: Date) => {
    return formatDistanceToNow(date, {
        addSuffix: true,
    });
};
