import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const loading = () => {
    return (
        <section>
            <h1 className="h1-bold text-dark100_light900">All Tags</h1>

            <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
                <Skeleton className="h-14 flex-1" />
                <Skeleton className="h-14 w-28" />
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                    <Skeleton
                        key={item}
                        className="h-40 w-full rounded-2xl"
                    />
                ))}
            </div>
        </section>
    );
};

export default loading;
