import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const loading = () => {
    return (
        <section>
            <h1 className="h1-bold text-dark100_light900">Jobs</h1>

            <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
                <Skeleton className="h-14 flex-1" />
                <div className="flex gap-3">
                    <Skeleton className="h-14 w-28" />
                    <Skeleton className="h-14 w-28" />
                </div>
            </div>

            <div className="mt-12 flex flex-col gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <Skeleton
                        key={item}
                        className="h-64 w-full rounded-2xl"
                    />
                ))}
            </div>
        </section>
    );
};

export default loading;
