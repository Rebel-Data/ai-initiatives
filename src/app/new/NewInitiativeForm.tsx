"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

const STATUSES = [
  { value: "exploring", label: "Exploring" },
  { value: "building", label: "Building" },
  { value: "shipped", label: "Shipped" },
];

export default function NewInitiativeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<string>("exploring");
  const [resourceUrl, setResourceUrl] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/initiatives"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          status,
          resourceUrl,
          deploymentUrl,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to create initiative");
      }
      const created = await res.json();
      router.push(`/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Share an AI initiative</h2>
        <p className="text-gray-600 mt-1">
          Tell the rest of Rebel what you&apos;re exploring or building. Others can then
          sign up to contribute or get updates.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI-assisted tender analysis"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red/30 focus:border-rebel-red"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            What are you working on?
          </label>
          <textarea
            id="description"
            required
            rows={6}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem, the AI angle, and what &quot;working&quot; looks like. Include links if you have them."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red/30 focus:border-rebel-red"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category (optional)
            </label>
            <input
              id="category"
              type="text"
              maxLength={50}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. tooling, research, ops"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red/30 focus:border-rebel-red"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red/30 focus:border-rebel-red bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="resourceUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Code or explanation (optional)
          </label>
          <input
            id="resourceUrl"
            type="url"
            maxLength={500}
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder="https://github.com/... or SharePoint / Notion / Google Doc link"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red/30 focus:border-rebel-red"
          />
          <p className="text-xs text-gray-500 mt-1">
            Where can people find the repo, design doc, or write-up?
          </p>
        </div>

        <div>
          <label htmlFor="deploymentUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Deployed version (optional)
          </label>
          <input
            id="deploymentUrl"
            type="url"
            maxLength={500}
            value={deploymentUrl}
            onChange={(e) => setDeploymentUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red/30 focus:border-rebel-red"
          />
          <p className="text-xs text-gray-500 mt-1">
            If there&apos;s something running people can try, link it here.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-rebel-red text-white rounded-lg hover:bg-rebel-red/90 font-medium disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create initiative"}
          </button>
        </div>
      </form>
    </div>
  );
}
