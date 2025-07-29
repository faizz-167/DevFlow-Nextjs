"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { formUrlQuery } from "@/lib/url";

interface Filter {
    name: string;
    value: string;
}
interface Props {
    filters: Filter[];
    otherClasses?: string;
    containerClasses?: string;
}

const CommonFilter = ({
    filters,
    otherClasses = "",
    containerClasses = "",
}: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ParamsFilter = searchParams.get("filter");

    const handleUpdateParams = (value: string) => {
        const newUrl = formUrlQuery({
            params: searchParams.toString(),
            key: "filter",
            value,
        });

        router.push(newUrl, { scroll: false });
    };

    return (
        <div className={cn("relative", containerClasses)}>
            <Select
                onValueChange={handleUpdateParams}
                defaultValue={ParamsFilter || undefined}
            >
                <SelectTrigger
                    className={cn(
                        "w-full body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5",
                        otherClasses
                    )}
                >
                    <div className="line-clamp-1 flex-1 text-left">
                        <SelectValue placeholder="Select a Filter" />
                    </div>
                </SelectTrigger>

                <SelectContent>
                    <SelectGroup>
                        {filters.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value}>
                                {filter.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default CommonFilter;
