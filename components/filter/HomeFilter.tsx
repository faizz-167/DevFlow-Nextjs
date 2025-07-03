"use client";
import React, { useState } from "react";
import { useQueryState } from "nuqs";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
// import { useRouter, useSearchParams } from "next/navigation";
// import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
const filters = [
    { name: "newest", value: "newest" },
    { name: "popular", value: "popular" },
    { name: "unanswered", value: "unanswered" },
    { name: "recommended", value: "recommended" },
];

const HomeFilter = () => {
    // const searchParams = useSearchParams();
    // const filterParams = searchParams.get("filter");
    // const [activeFilter, setActiveFilter] = useState(filterParams || "");
    // const router = useRouter();
    // const handleTypeClick = (filter: string) => {
    //     let newUrl = "";
    //     if (filter !== activeFilter) {
    //         setActiveFilter(filter);
    //         newUrl = formUrlQuery({
    //             params: searchParams.toString(),
    //             key: "filter",
    //             value: filter.toLowerCase(),
    //         });
    //     } else {
    //         setActiveFilter("");
    //         newUrl = removeKeysFromUrlQuery({
    //             params: searchParams.toString(),
    //             keysToRemove: ["filter"],
    //         });
    //     }
    //     router.push(newUrl, { scroll: false });
    // };

    const [active, setActive] = useQueryState("filter", {
        defaultValue: "",
        parse: (value) => value as string,
        shallow: false,
        throttleMs: 300,
    });

    const handleTypeClick = (value: string) => {
        if (active === value) {
            setActive("");
        } else {
            setActive(value);
        }
    };

    return (
        <div className="mt-10 hidden sm:flex flex-wrap gap-3">
            {filters.map((filter) => (
                <Button
                    key={filter.value}
                    className={cn(
                        "body-medium rounded-lg px-6 py-3 capitalize shadow-none",
                        active === filter.value
                            ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
                            : "bg-light-800 text-light-500 hover:bg-light-700 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-400"
                    )}
                    onClick={() => handleTypeClick(filter.value)}
                >
                    {filter.name}
                </Button>
            ))}
        </div>
    );
};

export default HomeFilter;
