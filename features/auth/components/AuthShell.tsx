import { Logo } from "@/shared/components/Logo";

const features = [
  "Drag-and-drop agent canvas",
  "Web search, weather, GitHub & custom API tools",
  "Live streaming test chat",
];

function FlowPreview() {
  const node =
    "rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur";
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className={node}>Start</div>
      <div className="h-px w-8 bg-white/40" />
      <div className={`${node} border-white/40 bg-white/20 shadow-lg shadow-black/20`}>
        Agent
        <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-emerald-300" />
      </div>
      <div className="h-px w-8 bg-white/40" />
      <div className={node}>End</div>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[oklch(0.13_0_0)] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.10),transparent_45%),radial-gradient(circle_at_90%_100%,oklch(0.58_0.2_262/0.28),transparent_55%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />

        <div className="relative [&_span]:text-white">
          <Logo href="/login" />
        </div>

        <div className="relative space-y-8">
          <FlowPreview />
          <div className="space-y-4">
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight">
              Build AI agents,
              <br />
              without the busywork.
            </h2>
            <p className="max-w-md text-base text-white/70">
              Design an agent visually, give it real tools and chat with it
              while the answers stream in live.
            </p>
          </div>
          <ul className="space-y-2.5 text-sm text-white/85">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <svg
                  viewBox="0 0 20 20"
                  className="size-4 shrink-0 text-emerald-300"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} AgentForge
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="mb-10 lg:hidden">
          <Logo href="/login" />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
