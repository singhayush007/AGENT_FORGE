import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const currencyTool = tool(
  async ({ amount, from, to }) => {
    const f = from.toUpperCase();
    const t = to.toUpperCase();
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?amount=${encodeURIComponent(String(amount))}&from=${f}&symbols=${t}`
    );

    if (!res.ok) return `Could not convert ${f} to ${t}. Check the currency codes (e.g. USD, EUR, INR).`;
    const data = await res.json();
    const converted = data.rates?.[t];

    if (converted === undefined) return `No rate available for ${f} to ${t}.`;
    return JSON.stringify({ amount, from: f, to: t, converted, date: data.date });
  },
  {
    name: "currency_converter",
    description: "Convert an amount between currencies using the latest exchange rates",
    schema: z.object({
      amount: z.number().describe("Amount to convert"),
      from: z.string().describe("Source currency code, e.g. USD"),
      to: z.string().describe("Target currency code, e.g. INR"),
    }),
  }
);
