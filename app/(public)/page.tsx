import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import { LandingPage } from "@/features/landing/views/LandingPage";

// Public landing page. Signed-in users just see a "Dashboard" button.
export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <LandingPage signedIn={Boolean(session)} />;
}
