import type { StructuredTool } from "@langchain/core/tools";
import type { AgentNodeConfig } from "@/shared/types/workflow.types";
import { isCustomToolConfig } from "@/shared/utils/customTool.utils";
import { buildCustomTool } from "@/features/tools/services/customHttp.service";
import { calculatorTool } from "@/features/tools/services/calculator.tool";
import { readWebpageTool } from "@/features/tools/services/readWebpage.tool";
import { datetimeTool } from "@/features/tools/services/datetime.tool";
import { wikipediaTool } from "@/features/tools/services/wikipedia.tool";
import { currencyTool } from "@/features/tools/services/currency.tool";
import { hackerNewsTool } from "@/features/tools/services/hackerNews.tool";
import { weatherTool } from "@/features/tools/services/weather.tool";
import { webSearchTool } from "@/features/tools/services/webSearch.tool";
import { getGithubToken } from "@/features/tools/services/github/githubToken.service";
import { createGithubTools } from "@/features/tools/services/github/githubTools.service";

const builtInTools: Record<string, StructuredTool> = {
  calculator: calculatorTool,
  weather: weatherTool,
  web_search: webSearchTool,
  read_webpage: readWebpageTool,
  current_datetime: datetimeTool,
  wikipedia: wikipediaTool,
  currency_converter: currencyTool,
  hacker_news: hackerNewsTool,
};

const githubToolIds = [
  "github_read_file",
  "github_search_code",
  "github_get_pr",
  "github_get_diff",
];

export async function getToolsForAgent(config: AgentNodeConfig, userId: string) {
  const tools: StructuredTool[] = [];
  const needsGithub = config.tools.some((t) => githubToolIds.includes(t.toolId));

  let githubTools: Record<string, StructuredTool> = {};
  if (needsGithub) {
    const token = await getGithubToken(userId);
    githubTools = createGithubTools(token, {
      owner: config.github?.owner,
      repo: config.github?.repo,
      defaultPrNumber: config.github?.defaultPrNumber,
    });
  }

  for (const t of config.tools) {
    if (isCustomToolConfig(t.config)) {
      tools.push(buildCustomTool(t.config));
      continue;
    }

    const builtIn = builtInTools[t.toolId] ?? githubTools[t.toolId];
    if (builtIn) {
      tools.push(builtIn);
    }
  }

  return tools;
}
