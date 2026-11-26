import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "danger" | "secondary" | "ghost" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand " +
  "[&_svg]:size-[1.125rem] [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-card hover:bg-brand-dark",
  danger: "bg-expense text-white shadow-card hover:bg-expense/90",
  secondary:
    "border border-border-strong bg-surface text-ink shadow-card hover:bg-surface-alt hover:border-ink-faint/40",
  soft: "bg-brand-soft text-brand-dark hover:bg-brand-soft/70",
  ghost: "text-ink-muted hover:bg-surface-alt hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-[0.9375rem]",
  lg: "h-12 px-5 text-base",
  icon: "size-11",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string; "aria-label"?: string; prefetch?: boolean };

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export default function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", className, children, loading } = props;
  const classes = buttonClass(variant, size, className);

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={classes}
        aria-label={props["aria-label"]}
        prefetch={props.prefetch}
      >
        {children}
      </Link>
    );
  }

  const {
    href: _h,
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    loading: _l,
    disabled,
    ...rest
  } = props as AsButton;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
