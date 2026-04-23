import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["exploring", "building", "shipped", "archived"] as const;
type Status = (typeof VALID_STATUSES)[number];

function isValidStatus(v: unknown): v is Status {
  return typeof v === "string" && (VALID_STATUSES as readonly string[]).includes(v);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifySession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const initiative = await prisma.aiInitiative.findUnique({
    where: { id: params.id },
    include: { members: { orderBy: { createdAt: "asc" } } },
  });

  if (!initiative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(initiative);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifySession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.aiInitiative.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canEdit = user.role === "admin" || existing.ownerId === user.id;
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, description, category, status } = body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  if (title.length > 200) {
    return NextResponse.json(
      { error: "Title must be 200 characters or fewer" },
      { status: 400 }
    );
  }
  if (description.length > 5000) {
    return NextResponse.json(
      { error: "Description must be 5000 characters or fewer" },
      { status: 400 }
    );
  }

  const updated = await prisma.aiInitiative.update({
    where: { id: params.id },
    data: {
      title: title.trim(),
      description: description.trim(),
      category: typeof category === "string" && category.trim() ? category.trim() : null,
      status: isValidStatus(status) ? status : existing.status,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifySession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.aiInitiative.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canDelete = user.role === "admin" || existing.ownerId === user.id;
  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.aiInitiative.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
