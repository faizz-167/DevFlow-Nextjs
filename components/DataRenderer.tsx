import { DEFAULT_EMPTY, DEFAULT_ERROR } from "@/constants/states";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props<T> {
    success: boolean;
    data: T[] | null| undefined;
    error?: {
        message: string;
        details?: Record<string, string[]>;
    };
    empty: {
        title: string;
        message: string;
        button: {
            text: string;
            href: string;
        };
    };
    render?: (data: T[]) => React.ReactNode;
}

interface StateSkeletonProps {
    image: {
        light: string;
        dark: string;
        alt: string;
    };
    title: string;
    message: string;
    button?: {
        text: string;
        href: string;
    };
}

const StateSkeleton = ({
    image,
    title,
    message,
    button,
}: StateSkeletonProps) => (
    <div className="mt-16 flex w-full flex-col items-center justify-center sm:mt-36">
        <>
            <Image
                src={image.dark}
                alt={image.alt}
                width={270}
                height={200}
                className="hidden object-contain dark:block"
            />
            <Image
                src={image.light}
                alt={image.alt}
                width={270}
                height={200}
                className="hidden object-contain dark:hidden"
            />
            <h2 className="mt-8 h2-bold text-dark200_light900">{title}</h2>
            <p className="body-reguler text-dark500_light700 my-3.5 max-w-md text-center">
                {message}
            </p>
            <p>
                {button && (
                    <Link href={button.href}>
                        <Button className="paragaraph-medium mt-5 min-h-[46px] rounded-lg bg-primary-500 px-4 py-3 text-light-900 hover:bg-primary-500">
                            {button.text}
                        </Button>
                    </Link>
                )}
            </p>
        </>
    </div>
);

const DataRenderer = <T,>({
    success,
    data,
    error,
    empty = DEFAULT_EMPTY,
    render,
}: Props<T>) => {
    if (!success) {
        return (
            <StateSkeleton
                image={{
                    light: "/images/light-error.png",
                    dark: "/images/dark-error.png",
                    alt: "No Data",
                }}
                title={error?.message || "An error occurred"}
                message={
                    error?.details
                        ? JSON.stringify(error.details, null, 2)
                        : DEFAULT_ERROR.message
                }
                button={DEFAULT_ERROR.button}
            />
        );
    }

    if (!data?.length) {
        return (
            <StateSkeleton
                image={{
                    light: "/images/light-illustration.png",
                    dark: "/images/dark-illustration.png",
                    alt: "No Data",
                }}
                title={empty.title}
                message={empty.message}
                button={empty.button}
            />
        );
    }

    return <>{render?.(data)}</>;
};

export default DataRenderer;
