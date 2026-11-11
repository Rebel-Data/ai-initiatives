"use client";

import { useEffect, useRef, useState } from "react";

export function initials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function AccountMenu({
  name,
  email,
}: {
  name?: string | null;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full bg-white text-[#EF4035] text-sm font-bold flex items-center justify-center hover:bg-white/90"
      >
        {initials(name, email)}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-20"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            {name && <div className="text-sm font-bold text-gray-900 truncate">{name}</div>}
            <div className="text-xs text-gray-500 truncate">{email}</div>
          </div>
          <a
            role="menuitem"
            href="https://rgmp.net/signout"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </a>
        </div>
      )}
    </div>
  );
}
