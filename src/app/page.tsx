import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession, loginUrl } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

const STATUS_LABEL: Record<string, string> = {
  exploring: "Exploring",
  building: "Building",
  shipped: "Shipped",
  archived: "Archived",
};

const STATUS_STYLE: Record<string, string> = {
  exploring: "bg-blue-100 text-blue-700",
  building: "bg-amber-100 text-amber-800",
  shipped: "bg-green-100 text-green-700",
  archived: "bg-gray-200 text-gray-600",
};

interface MemberPreview {
  id: string;
  role: string;
  userName: string | null;
  userEmail: string;
}

const NAME_PREVIEW_COUNT = 3;

function displayName(m: MemberPreview): string {
  if (m.userName) return m.userName;
  return m.userEmail.split("@")[0] ?? m.userEmail;
}

function namePreview(members: MemberPreview[]): string {
  if (members.length === 0) return "";
  const shown = members.slice(0, NAME_PREVIEW_COUNT).map(displayName);
  const extra = members.length - shown.length;
  return extra > 0 ? `${shown.join(", ")} +${extra}` : shown.join(", ");
}

function InterestSummary({
  contributors,
  followers,
}: {
  contributors: MemberPreview[];
  followers: MemberPreview[];
}) {
  if (contributors.length === 0 && followers.length === 0) {
    return (
      <div className="mt-3 text-xs text-gray-400">Nobody signed up yet.</div>
    );
  }
  return (
    <div className="mt-3 space-y-1 text-xs">
      {contributors.length > 0 && (
        <div className="text-gray-700">
          <span className="font-medium text-rebel-red">
            {contributors.length}{" "}
            {contributors.length === 1 ? "contributor" : "contributors"}
          </span>
          <span className="text-gray-500"> — {namePreview(contributors)}</span>
        </div>
      )}
      {followers.length > 0 && (
        <div className="text-gray-600">
          <span className="font-medium">
            {followers.length}{" "}
            {followers.length === 1 ? "follower" : "followers"}
          </span>
          <span className="text-gray-500"> — {namePreview(followers)}</span>
        </div>
      )}
    </div>
  );
}

export default async function ListPage() {
  const user = await verifySession();
  if (!user) redirect(loginUrl("/ai-initiatives"));

  const initiatives = await prisma.aiInitiative.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      members: {
        select: { id: true, role: true, userName: true, userEmail: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Initiatives across Rebel
            </h2>
            <p className="text-gray-600 mt-1">
              Share what AI-powered tooling or initiatives you&apos;re exploring. Sign up
              to contribute or get updates on anything that catches your eye.
            </p>
          </div>
          <Link
            href="/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-rebel-red text-white rounded-lg hover:bg-rebel-red/90 font-medium"
          >
            + New initiative
          </Link>
        </div>

        {initiatives.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">
              No initiatives yet. Be the first to{" "}
              <Link href="/new" className="text-rebel-red hover:underline">
                share what you&apos;re working on
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initiatives.map((init) => {
              const contributors = init.members.filter((m) => m.role === "contributor");
              const followers = init.members.filter((m) => m.role === "follower");
              return (
                <Link
                  key={init.id}
                  href={`/${init.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-rebel-red hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg text-gray-900 leading-snug">
                      {init.title}
                    </h3>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_STYLE[init.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABEL[init.status] ?? init.status}
                    </span>
                  </div>

                  {init.category && (
                    <div className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                      {init.category}
                    </div>
                  )}

                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {init.description}
                  </p>

                  <div className="mt-4 text-xs text-gray-500">
                    By {init.ownerName || init.ownerEmail || "Unknown"}
                  </div>

                  <InterestSummary contributors={contributors} followers={followers} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
