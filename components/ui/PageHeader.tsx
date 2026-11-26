import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href = "/", label = "Dasbor" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="-ml-1.5 mb-2 inline-flex h-9 items-center gap-0.5 rounded-lg pr-2.5 pl-1 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
    >
      <ChevronLeft className="size-[1.125rem]" aria-hidden />
      {label}
    </Link>
  );
}

export default function PageHeader({
  title,
  description,
  backHref = "/",
  backLabel = "Dasbor",
  action,
}: {
  title: string;
  description?: string;
  backHref?: string | null;
  backLabel?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 sm:mb-7">
      {backHref && <BackLink href={backHref} label={backLabel} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink sm:text-[1.75rem] sm:leading-9">{title}</h1>
          {description && <p className="mt-1 text-[0.9375rem] text-ink-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
