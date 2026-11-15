"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ErrorState } from "@/shared/components/ErrorState";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getToolLabel } from "@/shared/utils/tools.utils";
import { PageHeader } from "@/shared/components/PageHeader";
import { getAnalytics } from "@/features/analytics/actions/analytics.actions";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
}

export function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
  });

  return (
    <>
      <PageHeader title="Analytics" description="How your agents are being used in the last 14 days." />

      {isError ? (
        <ErrorState onRetry={() => refetch()} title="Could not load analytics" />
      ) : isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <p className="font-heading text-3xl font-semibold" data-testid="total-questions">{data.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Questions asked</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <p className="font-heading text-3xl font-semibold">{data.totalToolCalls}</p>
              <p className="text-xs text-muted-foreground">Tool calls</p>
            </div>
          </div>

          <Card title="Messages per day" subtitle="Questions you asked and replies from your agents">
            {data.totalQuestions === 0 ? (
              <Empty text="No chats yet. Talk to an agent and your activity shows up here." />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.daily} margin={{ left: -20, right: 4 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                    <Bar dataKey="questions" name="Questions" stackId="a" fill="var(--primary)" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="replies" name="Replies" stackId="a" fill="var(--primary)" fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Most used tools">
              {data.tools.length === 0 ? (
                <Empty text="No tool calls yet." />
              ) : (
                <ul className="space-y-3">
                  {data.tools.map((t) => (
                    <li key={t.tool}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{getToolLabel(t.tool)}</span>
                        <span className="text-muted-foreground">{t.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(t.count / data.tools[0].count) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Busiest agents" subtitle="By questions asked">
              {data.topAgents.length === 0 ? (
                <Empty text="No conversations yet." />
              ) : (
                <ul className="space-y-3">
                  {data.topAgents.map((a, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-lg">{a.icon}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.name}</span>
                      <span className="text-sm text-muted-foreground">{a.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
