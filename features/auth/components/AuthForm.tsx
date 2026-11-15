"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  GithubIcon,
  Mail01Icon,
  LockPasswordIcon,
  UserIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";

import { authClient } from "@/shared/lib/authClient";
import { signIn as signInWithGithub } from "@/features/auth/actions/auth.actions";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Spinner } from "@/shared/components/ui/spinner";

type Mode = "login" | "signup";

const authMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PASSWORD: "Incorrect email or password.",
  USER_ALREADY_EXISTS: "An account with this email already exists. Try signing in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists. Try signing in instead.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORD_TOO_LONG: "That password is too long.",
};

function friendlyAuthError(error: { code?: string; message?: string; status?: number }) {
  if (error.code && authMessages[error.code]) return authMessages[error.code];
  if (error.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (error.status && error.status >= 500) return "The server had a problem. Please try again.";
  return error.message || "Something went wrong. Please try again.";
}

const copy = {
  login: {
    title: "Welcome back",
    description: "Sign in to continue to AgentForge",
    submit: "Sign in",
    switchText: "Don't have an account?",
    switchLabel: "Sign up",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your account",
    description: "Start building AI agents in minutes",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const t = copy[mode];

  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    setPending(true);
    try {
      const { error } =
        mode === "signup"
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password });

      if (error) {
        setError(friendlyAuthError(error));
        setPending(false);
        return;
      }

      router.push("/agents");
      router.refresh();
    } catch {
      // fetch itself failed: offline or server down
      setError("Could not reach the server. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>

      <form action={signInWithGithub}>
        <Button type="submit" variant="outline" size="lg" className="w-full">
          <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
          Continue with GitHub
        </Button>
      </form>

      <FieldGroup>
        <FieldSeparator>or continue with email</FieldSeparator>
      </FieldGroup>

      <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
        {error ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup className="gap-4">
          {mode === "signup" ? (
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                </InputGroupAddon>
                <InputGroupInput
                  id="name"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </InputGroup>
            </Field>
          ) : null}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <HugeiconsIcon
                    icon={showPassword ? ViewOffIcon : ViewIcon}
                    strokeWidth={2}
                  />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {mode === "signup" ? (
              <FieldDescription>Use at least 8 characters.</FieldDescription>
            ) : null}
          </Field>
        </FieldGroup>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <Spinner /> : null}
          {t.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t.switchText}{" "}
        <Link
          href={t.switchHref}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t.switchLabel}
        </Link>
      </p>
    </div>
  );
}
