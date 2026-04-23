import Link from "next/link";
import type { SessionUser } from "@/lib/auth";

const RGMP_URL = process.env.RGMP_AUTH_URL || process.env.RGMP_URL || "https://rgmp.net";

export default function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-[#EF4035] px-6 py-3 flex items-center z-10">
        <div className="flex items-center gap-3 flex-1">
          <a
            href={RGMP_URL}
            className="text-2xl text-white hover:text-white/80 transition-opacity"
            aria-label="Back to RGMP"
          >
            ←
          </a>
          <h1 className="text-xl font-bold text-white">AI Initiatives</h1>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <Link
            href="/"
            className="text-sm text-white hover:text-white/90 font-medium"
          >
            All initiatives
          </Link>
          <Link
            href="/new"
            className="text-sm text-white hover:text-white/90 font-medium"
          >
            + New
          </Link>
          <span className="text-sm text-white">{user.name ?? user.email}</span>
          <a
            href={`${RGMP_URL}/api/auth/signout`}
            className="text-sm text-white hover:text-white/90 underline underline-offset-2"
          >
            Sign out
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-2 px-4 text-center">
        <span className="text-xs text-gray-400">
          Version: {(process.env.NEXT_PUBLIC_COMMIT_HASH || "dev").substring(0, 7)}
        </span>
      </footer>
    </div>
  );
}
