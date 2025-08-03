import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const loading = () => {
    return (
        <section>
            <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>

            <div className="mt-9 flex flex-col gap-10">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-14 w-full" />
                </div>

                <div className="flex flex-col gap-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-40 w-full" />
                </div>

                <div className="flex flex-col gap-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-14 w-full" />
                </div>

                <Skeleton className="h-12 w-32" />
            </div>
        </section>
    );
};

export default loading;
