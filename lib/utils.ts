import { nameMap, techDescriptionMap } from "@/constants/nameMap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { BADGE_CRITERIA } from "@/constants";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getDeviconClassName = (name: string) => {
    const normalizeName = name.toLowerCase().replace(/[ .]/g, "");

    return nameMap[normalizeName]
        ? `${nameMap[normalizeName]} colored`
        : "devicon-devicon-plain";
};

export const getTechDescription = (techName: string) => {
    const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();
    return techDescriptionMap[normalizedTechName]
        ? techDescriptionMap[normalizedTechName]
        : `${techName} is a technology or tool widely used in web development, providing valuable features and capabilities.`;
};

export const getTimeStamp = (createdAt: Date) => {
    const date = new Date(createdAt);
    return formatDistanceToNow(date, {
        addSuffix: true,
    });
};

export const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};

export function assignBadges(params: {
    criteria: {
        type: keyof typeof BADGE_CRITERIA;
        count: number;
    }[];
}) {
    const badgeCounts: Badges = {
        GOLD: 0,
        SILVER: 0,
        BRONZE: 0,
    };

    const { criteria } = params;

    criteria.forEach((item) => {
        const { type, count } = item;
        const badgeLevels = BADGE_CRITERIA[type];

        Object.keys(badgeLevels).forEach((level) => {
            if (count >= badgeLevels[level as keyof typeof badgeLevels]) {
                badgeCounts[level as keyof Badges] += 1;
            }
        });
    });

    return badgeCounts;
}
