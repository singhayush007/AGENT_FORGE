import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/shared/lib/db"; // your prisma client instance
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
    },

    socialProviders:{
        github:{
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            // "scope" adds to the defaults (read:user, user:email). "repo" lets the GitHub tools read private repos.
            scope: ["repo"],
        }
    },
    plugins: [nextCookies()],
});