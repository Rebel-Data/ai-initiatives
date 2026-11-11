import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import AccountMenu from "@/components/AccountMenu";

export default function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-rebel-red px-6 py-3 flex items-center z-10">
        <div className="flex items-center gap-3 flex-1">
          <a
            href="https://rgmp.net/"
            className="text-sm text-white hover:text-white/80 transition-opacity font-medium"
            aria-label="Back to Rebel hub"
          >
            ← Rebel hub
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
          <AccountMenu name={user.name} email={user.email} />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xs border-t border-gray-200 py-2 px-4 text-center">
        <span className="text-xs text-gray-400">
          Version: {(process.env.NEXT_PUBLIC_COMMIT_HASH || "dev").substring(0, 7)}
        </span>
      </footer>
    </div>
  );
}
