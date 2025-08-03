import Image from "next/image";
import React from "react";
import Link from "next/link";
interface Props {
    imgUrl: string;
    href?: string;
    title: string;
}

const ProfileLink = ({ imgUrl, href, title }: Props) => {
    return (
        <div className="flex-center gap-1">
            <Image src={imgUrl} alt={title} width={20} height={20} />
            {href ? (
                <Link
                    href={href}
                    target="_blank"
                    className="paragraph-medium text-link-100"
                >
                    {title}
                </Link>
            ) : (
                <span className="paragraph-medium text-dark400_light700">
                    {title}
                </span>
            )}
        </div>
    );
};

export default ProfileLink;
