import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
    imgUrl: string;
    title: string;
    value: String | number;
    textStyles: string;
    href?: string;
    alt: string;
    isAuthor?: boolean;
    imgStyles?: string;
}

const Metric = ({
    imgUrl,
    title,
    value,
    textStyles,
    href,
    alt,
    isAuthor,
    imgStyles,
}: Props) => {
    const metricContent = (
        <>
            <Image
                src={imgUrl}
                alt={alt}
                width={16}
                height={16}
                className={`rounded-full object-contain ${imgStyles}`}
            />
            <p className={`${textStyles} flex items-center gap-1`}>
                {value}
                <span
                    className={`small-regular line-clamp-1 ${isAuthor ? "max-sm:hidden" : ""}`}
                >
                    {title}
                </span>
            </p>
        </>
    );
    return href ? (
        <Link href={href} className="flex-center gap-1">
            {metricContent}
        </Link>
    ) : (
        <div className="flex-center gap-1">{metricContent}</div>
    );
};

export default Metric;
