'use client'

import Image from "next/image";
import React from "react";

type Props = {
    children?: React.ReactNode;
    href?: string | null;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    iconSrc?: string;
    showIcon?: boolean;
    className?: string;
};

const ExploreBtn = ({
    children,
    href = '#events',
    onClick,
    type = 'button',
    disabled = false,
    iconSrc = '/icons/arrow-down.svg',
    showIcon = true,
    className = '',
}: Props) => {
    const isLink = typeof href === 'string' && href.length > 0;

    return (
        <button
            type={type}
            id="explore-btn"
            className={`mt-7 mx-auto ${className}`}
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
        >
            {isLink ? (
                <a href={href as string}>
                    {children ?? 'Explore Events'}
                    {showIcon && (
                        <Image
                            src={iconSrc}
                            alt="Explore"
                            width={24}
                            height={24}
                            className="invert"
                        />
                    )}
                </a>
            ) : (
                <span className="flex-center gap-2 w-full">
                    {children ?? 'Explore Events'}
                    {showIcon && (
                        <Image
                            src={iconSrc}
                            alt="Explore"
                            width={24}
                            height={24}
                            className="invert"
                        />
                    )}
                </span>
            )}
        </button>
    )
}
export default ExploreBtn
