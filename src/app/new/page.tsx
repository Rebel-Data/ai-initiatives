import { redirect } from "next/navigation";
import { verifySession, loginUrl } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import NewInitiativeForm from "./NewInitiativeForm";

export default async function NewInitiativePage() {
  const user = await verifySession();
  if (!user) redirect(loginUrl("/ai-initiatives/new"));

  return (
    <AppShell user={user}>
      <NewInitiativeForm />
    </AppShell>
  );
}
