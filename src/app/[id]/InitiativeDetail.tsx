"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type MemberRole = "contributor" | "follower";

interface Member {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  role: string;
}

interface Initiative {
  id: string;
  title: string;
  description: string;
  category: string | null;
  status: string;
  ownerName: string | null;
  ownerEmail: string;
  updatedAt: string;
  members: Member[];
}

interface Props {
  initiative: Initiative;
  canEdit: boolean;
  ownRole: string | null;
}

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

const STATUS_OPTIONS = ["exploring", "building", "shipped", "archived"];

export default function InitiativeDetail({
  initiative: initial,
  canEdit,
  ownRole: initialOwnRole,
}: Props) {
  const router = useRouter();
  const [initiative, setInitiative] = useState(initial);
  const [ownRole, setOwnRole] = useState<string | null>(initialOwnRole);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initiative.title,
    description: initiative.description,
    category: initiative.category ?? "",
    status: initiative.status,
  });

  const contributors = initiative.members.filter((m) => m.role === "contributor");
  const followers = initiative.members.filter((m) => m.role === "follower");

  async function join(role: MemberRole) {
    setError(null);
    setJoining(true);
    try {
      const res = await fetch(`/api/initiatives/${initiative.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to join");
      }
      setOwnRole(role);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setJoining(false);
    }
  }

  async function leave() {
    setError(null);
    setJoining(true);
    try {
      const res = await fetch(`/api/initiatives/${initiative.id}/members`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to leave");
      }
      setOwnRole(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setJoining(false);
    }
  }

  async function saveEdit() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/initiatives/${initiative.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to save");
      }
      const updated = await res.json();
      setInitiative((prev) => ({
        ...prev,
        title: updated.title,
        description: updated.description,
        category: updated.category,
        status: updated.status,
      }));
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this initiative? This cannot be undone.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/initiatives/${initiative.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete");
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-gray-500 hover:text-rebel-red">
          ← All initiatives
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {editing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={form.title}
              maxLength={200}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full text-2xl font-bold px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Title"
            />
            <textarea
              value={form.description}
              maxLength={5000}
              rows={8}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Description"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={form.category}
                maxLength={50}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Category"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s] ?? s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setForm({
                    title: initiative.title,
                    description: initiative.description,
                    category: initiative.category ?? "",
                    status: initiative.status,
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 bg-rebel-red text-white rounded-lg hover:bg-rebel-red/90 font-medium disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{initiative.title}</h2>
                <div className="mt-1 text-sm text-gray-500 flex items-center gap-3 flex-wrap">
                  <span>By {initiative.ownerName || initiative.ownerEmail}</span>
                  <span className="text-gray-300">·</span>
                  <span>
                    Updated{" "}
                    {new Date(initiative.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {initiative.category && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="uppercase tracking-wide text-xs">
                        {initiative.category}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                  STATUS_STYLE[initiative.status] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {STATUS_LABEL[initiative.status] ?? initiative.status}
              </span>
            </div>

            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {initiative.description}
            </p>

            {canEdit && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-gray-600 hover:text-rebel-red"
                >
                  Edit
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={remove}
                  disabled={saving}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Get involved</h3>
          <p className="text-sm text-gray-600 mt-1">
            Sign up to <strong>contribute</strong> if you want to actively help, or just
            <strong> follow</strong> to get updates.
          </p>
        </div>

        {ownRole ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-700">
              You&apos;re signed up as{" "}
              <strong>{ownRole === "contributor" ? "a contributor" : "a follower"}</strong>.
            </span>
            {ownRole !== "contributor" && (
              <button
                onClick={() => join("contributor")}
                disabled={joining}
                className="px-3 py-1.5 text-sm rounded-lg border border-rebel-red text-rebel-red hover:bg-rebel-red hover:text-white disabled:opacity-60"
              >
                Switch to contributor
              </button>
            )}
            {ownRole !== "follower" && (
              <button
                onClick={() => join("follower")}
                disabled={joining}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Switch to follower
              </button>
            )}
            <button
              onClick={leave}
              disabled={joining}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 disabled:opacity-60"
            >
              Leave
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => join("contributor")}
              disabled={joining}
              className="px-4 py-2 bg-rebel-red text-white rounded-lg hover:bg-rebel-red/90 font-medium disabled:opacity-60"
            >
              Contribute
            </button>
            <button
              onClick={() => join("follower")}
              disabled={joining}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-60"
            >
              Get updates
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MemberList title={`Contributors (${contributors.length})`} members={contributors} />
        <MemberList title={`Followers (${followers.length})`} members={followers} />
      </div>
    </div>
  );
}

function MemberList({ title, members }: { title: string; members: Member[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
      {members.length === 0 ? (
        <p className="text-sm text-gray-500">Nobody yet.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="text-sm text-gray-700">
              {m.userName || m.userEmail}
              {m.userName && (
                <span className="text-gray-400"> — {m.userEmail}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
