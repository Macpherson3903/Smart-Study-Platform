"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";

import logo from "@/assets/logo.png";

export function BrandMark(props: {
  size?: number;
  withText?: boolean;
  className?: string;
}) {
  const size = props.size ?? 28;
  const withText = props.withText ?? true;

  return (
    <span className={cn("inline-flex items-center gap-2", props.className)}>
      <Image
        src={logo}
        alt="Smart Study Platform"
        width={size}
        height={size}
        priority
      />
      {withText ? (
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          Smart Study
        </span>
      ) : null}
    </span>
  );
}
