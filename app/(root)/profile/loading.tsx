import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const loading = () => {
    return (
        <section>
            <div className="flex flex-col-reverse items-start justify-between sm:flex-row">
                <div className="flex flex-col items-start gap-4 lg:flex-row">
                    <Skeleton className="size-32 rounded-full" />
                    <div className="mt-3 flex flex-col gap-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-60" />
                        <div className="mt-5 flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>
                <Skeleton className="h-10 w-28" />
            </div>

            <Skeleton className="mt-8 h-8 w-48" />

            <div className="mt-10 flex gap-10">
                {[1, 2, 3, 4].map((item) => (
                    <Skeleton key={item} className="h-8 w-20" />
                ))}
            </div>

            <div className="mt-5 flex w-full flex-col gap-6">
                {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton
                        key={item}
                        className="h-32 w-full rounded-xl"
                    />
                ))}
            </div>
        </section>
    );
};

export default loading;
