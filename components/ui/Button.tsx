"use client";

import type { ButtonHTMLAttributes } from "react";

import { Spinner } from "@/components/ui/Spinner";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/buttonStyles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

export { buttonClasses };
export type { ButtonSize, ButtonVariant };

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      className={buttonClasses({ variant, size, className })}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" label="Loading" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
