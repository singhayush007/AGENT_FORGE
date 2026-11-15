import { requireUnauth } from "@/features/auth/actions/auth.actions";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default async function SignInPage() {
  await requireUnauth();

  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
