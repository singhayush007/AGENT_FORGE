"use client";

import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";

export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
            <TooltipProvider>
                <QueryProvider>
                {children}
                </QueryProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}