import { notFound, redirect } from "next/navigation";
import { verifySession, loginUrl } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import InitiativeDetail from "./InitiativeDetail";

export default async function DetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await verifySession();
  if (!user) redirect(loginUrl(`/ai-initiatives/${params.id}`));

  const initiative = await prisma.aiInitiative.findUnique({
    where: { id: params.id },
    include: { members: { orderBy: { createdAt: "asc" } } },
  });

  if (!initiative) notFound();

  const canEdit = user.role === "admin" || initiative.ownerId === user.id;
  const ownRole =
    initiative.members.find((m) => m.userId === user.id)?.role ?? null;

  return (
    <AppShell user={user}>
      <InitiativeDetail
        initiative={{
          id: initiative.id,
          title: initiative.title,
          description: initiative.description,
          category: initiative.category,
          status: initiative.status,
          ownerName: initiative.ownerName,
          ownerEmail: initiative.ownerEmail,
          updatedAt: initiative.updatedAt.toISOString(),
          members: initiative.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            userEmail: m.userEmail,
            userName: m.userName,
            role: m.role,
          })),
        }}
        canEdit={canEdit}
        ownRole={ownRole}
      />
    </AppShell>
  );
}
