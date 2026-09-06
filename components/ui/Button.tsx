import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "danger" | "outline" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand",
  danger: "bg-expense text-white hover:bg-expense/90 focus-visible:ring-expense",
  outline:
    "border border-brand/40 text-brand bg-brand-soft/60 hover:bg-brand-soft focus-visible:ring-brand",
  secondary:
    "border border-border bg-surface text-ink hover:bg-surface-alt focus-visible:ring-ink-faint",
  ghost: "text-ink-muted hover:bg-surface-alt focus-visible:ring-ink-faint",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-sm min-h-10",
  md: "px-4 py-2.5 text-sm min-h-11",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string };

export default function Button(props: AsButton | AsLink) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as AsButton;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
