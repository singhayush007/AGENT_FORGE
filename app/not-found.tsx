import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo href="/" />
      <p className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text font-heading text-7xl font-semibold text-transparent">
        404
      </p>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you are looking for does not exist or was moved.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/agents" />}>
        Back to dashboard
      </Button>
    </div>
  );
}
