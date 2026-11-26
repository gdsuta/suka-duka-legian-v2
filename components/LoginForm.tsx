"use client";
import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Field, { inputClass } from "@/components/ui/Field";
import { login, type LoginState } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [lihat, setLihat] = useState(false);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-expense/20 bg-expense-soft p-3.5 text-sm font-medium text-expense"
        >
          <CircleAlert className="mt-px size-[1.125rem] shrink-0" aria-hidden />
          {state.error}
        </div>
      )}

      <Field label="Email" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state.email}
          placeholder="admin@contoh.com"
          className={inputClass}
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={lihat ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(inputClass, "pr-12")}
          />
          <button
            type="button"
            onClick={() => setLihat((v) => !v)}
            aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={lihat}
            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-alt hover:text-ink"
          >
            {lihat ? <EyeOff className="size-[1.125rem]" aria-hidden /> : <Eye className="size-[1.125rem]" aria-hidden />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" loading={pending} className="w-full">
        {!pending && <LogIn aria-hidden />}
        {pending ? "Memeriksa…" : "Masuk"}
      </Button>
    </form>
  );
}
