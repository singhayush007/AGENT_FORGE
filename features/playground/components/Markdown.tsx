"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Light, dependency-free styling for model output (no typography plugin needed).
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
        ul: (props) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
        ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
        h1: (props) => <h1 className="mb-2 mt-4 text-base font-semibold first:mt-0" {...props} />,
        h2: (props) => <h2 className="mb-2 mt-4 text-base font-semibold first:mt-0" {...props} />,
        h3: (props) => <h3 className="mb-1 mt-3 text-sm font-semibold first:mt-0" {...props} />,
        a: (props) => (
          <a
            className="font-medium text-primary underline underline-offset-2"
            target="_blank"
            rel="noreferrer noopener"
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground" {...props} />
        ),
        pre: (props) => (
          <pre
            className="my-3 overflow-x-auto rounded-xl border border-border bg-background p-3 text-xs"
            {...props}
          />
        ),
        code: ({ className, children, ...props }) => (
          <code
            className={
              className
                ? className
                : "rounded bg-background/70 px-1 py-0.5 font-mono text-[0.85em]"
            }
            {...props}
          >
            {children}
          </code>
        ),
        table: (props) => (
          <div className="my-3 max-w-full overflow-x-auto overscroll-x-contain pb-1">
            <table className="w-full border-collapse text-xs" {...props} />
          </div>
        ),
        th: (props) => <th className="border border-border bg-background px-2 py-1 text-left align-top font-medium" {...props} />,
        td: (props) => <td className="border border-border px-2 py-1 align-top [&_code]:whitespace-nowrap" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
