import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/buttonStyles";

type BaseAnchorProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
>;

export type ButtonLinkProps = BaseAnchorProps &
  LinkProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children: ReactNode;
  };

/**
 * A Next.js `Link` that looks and behaves like a `Button`. Use this instead of
 * hand-rolling `<Link className="inline-flex h-10 …">` so link-styled CTAs
 * stay in sync with `Button` whenever its styling evolves.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link
      {...linkProps}
      className={buttonClasses({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
