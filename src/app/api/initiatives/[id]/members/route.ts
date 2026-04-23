import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["contributor", "follower"] as const;
type MemberRole = (typeof VALID_ROLES)[number];

function isValidRole(v: unknown): v is MemberRole {
  return typeof v === "string" && (VALID_ROLES as readonly string[]).includes(v);
}

/**
 * Join (or update your role) on an initiative.
 * Idempotent: an existing membership is updated rather than duplicated.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifySession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const role: MemberRole = isValidRole(body?.role) ? body.role : "follower";

  const initiative = await prisma.aiInitiative.findUnique({ where: { id: params.id } });
  if (!initiative) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.aiInitiativeMember.upsert({
    where: {
      initiativeId_userId: {
        initiativeId: params.id,
        userId: user.id,
      },
    },
    update: {
      role,
      userEmail: user.email,
      userName: user.name ?? null,
    },
    create: {
      initiativeId: params.id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name ?? null,
      role,
    },
  });

  return NextResponse.json(member, { status: 201 });
}

/**
 * Leave an initiative (removes the caller's own membership).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await verifySession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.aiInitiativeMember.deleteMany({
    where: {
      initiativeId: params.id,
      userId: user.id,
    },
  });

  return NextResponse.json({ success: true });
}
