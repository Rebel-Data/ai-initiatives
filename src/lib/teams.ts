import type { AiInitiative } from "@prisma/client";

const PUBLIC_BASE_URL = "https://rgmp.net/ai-initiatives";
const POST_TIMEOUT_MS = 5000;
const DESCRIPTION_MAX = 400;

const STATUS_LABEL: Record<string, string> = {
  exploring: "Exploring",
  building: "Building",
  shipped: "Shipped",
  archived: "Archived",
};

type Kind = "created" | "updated";

export async function notifyTeams(initiative: AiInitiative, kind: Kind): Promise<void> {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) return;

  const card = buildCard(initiative, kind);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POST_TIMEOUT_MS);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[teams] webhook returned ${res.status}: ${detail.slice(0, 200)}`);
    }
  } catch (err) {
    console.error("[teams] webhook post failed:", err);
  } finally {
    clearTimeout(timeout);
  }
}

function buildCard(initiative: AiInitiative, kind: Kind) {
  const verb = kind === "created" ? "shared a new" : "updated an";
  const ownerLabel = initiative.ownerName || initiative.ownerEmail;
  const statusLabel = STATUS_LABEL[initiative.status] ?? initiative.status;
  const initiativeUrl = `${PUBLIC_BASE_URL}/${initiative.id}`;

  const facts: { title: string; value: string }[] = [{ title: "Status", value: statusLabel }];
  if (initiative.category) facts.push({ title: "Category", value: initiative.category });

  const actions: { type: "Action.OpenUrl"; title: string; url: string }[] = [
    { type: "Action.OpenUrl", title: "Open initiative", url: initiativeUrl },
  ];
  if (initiative.resourceUrl) {
    actions.push({ type: "Action.OpenUrl", title: "Code / explanation", url: initiative.resourceUrl });
  }
  if (initiative.deploymentUrl) {
    actions.push({ type: "Action.OpenUrl", title: "Deployment", url: initiative.deploymentUrl });
  }

  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: `${ownerLabel} ${verb} AI initiative`,
              weight: "bolder",
              size: "small",
              color: "accent",
              wrap: true,
            },
            {
              type: "TextBlock",
              text: initiative.title,
              weight: "bolder",
              size: "large",
              wrap: true,
            },
            { type: "FactSet", facts },
            {
              type: "TextBlock",
              text: truncate(initiative.description, DESCRIPTION_MAX),
              wrap: true,
              spacing: "Medium",
            },
          ],
          actions,
        },
      },
    ],
  };
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
