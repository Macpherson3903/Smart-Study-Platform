"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  orientation: "horizontal" | "vertical";
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs components must be used within <Tabs />");
  }
  return ctx;
}

export function Tabs(props: {
  children: ReactNode;
  className?: string;
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}) {
  const id = useId();
  const [internalValue, setInternalValue] = useState(props.defaultValue);
  const isControlled = typeof props.value === "string";
  const value = isControlled ? (props.value as string) : internalValue;

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    props.onValueChange?.(next);
  };

  const ctx: TabsContextValue = {
    value,
    setValue,
    baseId: id,
    orientation: props.orientation ?? "horizontal",
  };

  return (
    <TabsContext.Provider value={ctx}>
      <div className={props.className}>{props.children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  onKeyDown,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ctx = useTabsContext();

  return (
    <div
      {...props}
      role="tablist"
      aria-orientation={ctx.orientation}
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1",
        className,
      )}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;

        const isHorizontal = ctx.orientation === "horizontal";
        const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
        const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

        const supported = [
          prevKey,
          nextKey,
          "Home",
          "End",
          "Enter",
          " ",
        ] as const;

        if (!supported.includes(e.key as (typeof supported)[number])) return;

        const container = e.currentTarget;
        const tabs = Array.from(
          container.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]:not([disabled])',
          ),
        );

        if (tabs.length === 0) return;

        const current = document.activeElement as HTMLElement | null;
        const currentIndex = current
          ? tabs.findIndex((t) => t === current)
          : -1;

        const focusAndMaybeSelect = (el: HTMLButtonElement) => {
          el.focus();
          const nextValue = el.getAttribute("data-value");
          if (nextValue) ctx.setValue(nextValue);
        };

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (currentIndex >= 0) focusAndMaybeSelect(tabs[currentIndex]);
          return;
        }

        if (e.key === "Home") {
          e.preventDefault();
          focusAndMaybeSelect(tabs[0]);
          return;
        }

        if (e.key === "End") {
          e.preventDefault();
          focusAndMaybeSelect(tabs[tabs.length - 1]);
          return;
        }

        if (currentIndex === -1) return;

        if (e.key === nextKey) {
          e.preventDefault();
          focusAndMaybeSelect(tabs[(currentIndex + 1) % tabs.length]);
          return;
        }

        if (e.key === prevKey) {
          e.preventDefault();
          focusAndMaybeSelect(
            tabs[(currentIndex - 1 + tabs.length) % tabs.length],
          );
        }
      }}
    />
  );
}

export function TabsTrigger(props: {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const ctx = useTabsContext();
  const active = ctx.value === props.value;

  return (
    <button
      type="button"
      role="tab"
      data-value={props.value}
      id={triggerId(ctx.baseId, props.value)}
      aria-controls={contentId(ctx.baseId, props.value)}
      aria-selected={active}
      disabled={props.disabled}
      tabIndex={active ? 0 : -1}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors",
        active
          ? "bg-brand-600 text-white"
          : "text-slate-700 hover:bg-brand-50 hover:text-slate-900",
        props.disabled && "cursor-not-allowed opacity-60",
        props.className,
      )}
      onClick={() => ctx.setValue(props.value)}
    >
      {props.children}
    </button>
  );
}

export function TabsContent(props: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useTabsContext();
  const active = ctx.value === props.value;

  return (
    <div
      role="tabpanel"
      id={contentId(ctx.baseId, props.value)}
      aria-labelledby={triggerId(ctx.baseId, props.value)}
      hidden={!active}
      className={cn(active ? "mt-4" : "mt-4 hidden", props.className)}
    >
      {props.children}
    </div>
  );
}

function triggerId(baseId: string, value: string) {
  return `tabs-${baseId}-trigger-${value}`;
}

function contentId(baseId: string, value: string) {
  return `tabs-${baseId}-content-${value}`;
}
