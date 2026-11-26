"use client";
import { forwardRef } from "react";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

/** Input nominal: menampilkan pemisah ribuan (50.000), nilai disimpan sebagai string digit. */
const InputRupiah = forwardRef<
  HTMLInputElement,
  {
    id: string;
    value: string;
    onChange: (digits: string) => void;
    invalid?: boolean;
    describedBy?: string;
    placeholder?: string;
  }
>(function InputRupiah({ id, value, onChange, invalid, describedBy, placeholder = "0" }, ref) {
  const tampil = value ? Number(value).toLocaleString("id-ID") : "";

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-base font-medium text-ink-faint">
        Rp
      </span>
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={tampil}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10))}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(inputClass, "num pl-11 font-semibold")}
      />
    </div>
  );
});

export default InputRupiah;
