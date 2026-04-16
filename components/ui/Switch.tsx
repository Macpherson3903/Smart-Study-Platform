"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

export function Switch(props: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  id?: string;
}) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label
          id={labelId}
          className={cn(
            "block text-sm font-semibold text-slate-900",
            props.disabled && "text-slate-400",
          )}
        >
          {props.label}
        </label>
        {props.description ? (
          <p
            id={descriptionId}
            className={cn(
              "mt-1 text-sm text-slate-600",
              props.disabled && "text-slate-400",
            )}
          >
            {props.description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={props.checked}
        aria-labelledby={labelId}
        aria-describedby={props.description ? descriptionId : undefined}
        aria-disabled={props.disabled}
        onClick={() => {
          if (props.disabled) return;
          props.onCheckedChange(!props.checked);
        }}
        className={cn(
          "relative inline-flex h-6 w-11 flex-none items-center rounded-full border border-slate-200 bg-slate-100 transition-colors",
          props.checked && "bg-brand-600",
          props.disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
            props.checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

