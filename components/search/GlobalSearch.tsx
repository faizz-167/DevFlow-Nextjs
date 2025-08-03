"use client";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import GlobalResult from "../GlobalResult";

const GlobalSearch = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("global");

    const [search, setSearch] = useState(query || "");
    const [isOpen, setIsOpen] = useState(query || false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                // @ts-expect-error Property 'contains' does not exist on type 'EventTarget | null'.
                !searchContainerRef.current?.contains(event.target)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("click", handleOutsideClick);

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search) {
                const newUrl = formUrlQuery({
                    params: searchParams.toString(),
                    key: "global",
                    value: search,
                });

                router.push(newUrl, { scroll: false });
            } else {
                if (query) {
                    const newUrl = removeKeysFromUrlQuery({
                        params: searchParams.toString(),
                        keysToRemove: ["global", "type"],
                    });

                    router.push(newUrl, { scroll: false });
                }
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, pathname, router, searchParams, query]);
    return (
        <div
            className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4`}
        >
            <Image
                src={"/icons/search.svg"}
                width={24}
                height={24}
                alt="Search"
                className="cursor-pointer"
            />

            <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    if (!isOpen) setIsOpen(true);
                    if (e.target.value === "" && isOpen) setIsOpen(false);
                }}
                className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none !bg-transparent"
            />
            {isOpen && <GlobalResult />}
        </div>
    );
};

export default GlobalSearch;
