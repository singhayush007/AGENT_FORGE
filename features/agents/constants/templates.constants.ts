import type { AgentTemplate, TemplateCategory } from "@/features/agents/types/template.types";
import { defaultDefinition } from "@/shared/types/agentDefinition.types";

export const templateCategories: TemplateCategory[] = [
  "Everyday",
  "Research",
  "Productivity",
  "Developer",
  "Finance",
];

export const templates: AgentTemplate[] = [
  {
    id: "weather",
    name: "Weather Assistant",
    description: "Get forecasts for any city.",
    icon: "🌤️",
    category: "Everyday",
    welcomeMessage: "Ask me about the weather anywhere.",
    starterPrompts: ["What's the forecast in Tokyo?", "Will it rain in London this week?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a weather assistant. Give clear, concise forecasts. Mention temperature, conditions, and anything useful for planning.",
      tools: [{ toolId: "weather", config: {} }],
    },
  },
  {
    id: "web-research",
    name: "Web Research Assistant",
    description: "Search the web and summarize what you find.",
    icon: "🔍",
    category: "Research",
    welcomeMessage: "I can search the web and summarize results for you.",
    starterPrompts: ["Summarize recent news on AI agents", "What are people saying about Next.js 16?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a research assistant. Search the web, read pages when needed, and summarize findings. Cite your sources.",
      tools: [
        { toolId: "web_search", config: {} },
        { toolId: "read_webpage", config: {} },
      ],
    },
  },
  {
    id: "travel",
    name: "Travel Assistant",
    description: "Plan trips with weather, search, and quick math.",
    icon: "✈️",
    category: "Everyday",
    welcomeMessage: "Let's plan your next trip.",
    starterPrompts: ["Plan a weekend in Paris", "What's the weather like in Bali in December?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a travel assistant. Help users plan trips with weather info, web research, and simple calculations. Do not book flights or hotels.",
      tools: [
        { toolId: "weather", config: {} },
        { toolId: "web_search", config: {} },
        { toolId: "calculator", config: {} },
      ],
    },
  },
  {
    id: "writing",
    name: "Writing Assistant",
    description: "Help with drafts, edits, and ideas.",
    icon: "✍️",
    category: "Productivity",
    welcomeMessage: "Tell me what you'd like to write.",
    starterPrompts: ["Help me write a blog intro about AI", "Improve this paragraph for clarity"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a writing assistant. Help users draft, edit, and refine text. Be clear and match the tone they want.",
      tools: [{ toolId: "web_search", config: {} }],
    },
  },
  {
    id: "coding",
    name: "Coding Helper",
    description: "Explore repos and explain code.",
    icon: "💻",
    category: "Developer",
    welcomeMessage: "Ask me about code in your GitHub repos.",
    starterPrompts: ["Explain how auth works in my repo", "Find where we handle API routes"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a coding assistant. Help users understand code, find files, and explain how things work. Use GitHub tools when needed.",
      tools: [
        { toolId: "github_read_file", config: {} },
        { toolId: "github_search_code", config: {} },
        { toolId: "read_webpage", config: {} },
      ],
    },
  },
  {
    id: "pr-review",
    name: "PR Review Assistant",
    description: "Review pull requests for bugs and style.",
    icon: "🔎",
    category: "Developer",
    welcomeMessage: "Paste a PR link or ask me to review changes.",
    starterPrompts: ["Review this PR for bugs", "Summarize the changes in PR #42"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a PR review assistant. Look at diffs, spot bugs, suggest improvements, and summarize changes clearly.",
      tools: [
        { toolId: "github_get_pr", config: {} },
        { toolId: "github_get_diff", config: {} },
        { toolId: "read_webpage", config: {} },
      ],
    },
  },
  {
    id: "wiki-explainer",
    name: "Wikipedia Explainer",
    description: "Explain any topic simply, with sources.",
    icon: "📚",
    category: "Research",
    welcomeMessage: "Ask me to explain anything. I'll look it up on Wikipedia.",
    starterPrompts: ["Explain quantum computing like I'm 12", "Who was Ada Lovelace?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a friendly explainer. Look topics up on Wikipedia, then explain them simply in short paragraphs. Always include the source link.",
      tools: [{ toolId: "wikipedia", config: {} }],
    },
  },
  {
    id: "currency-helper",
    name: "Currency & Money Helper",
    description: "Convert currencies and do quick budget math.",
    icon: "💱",
    category: "Finance",
    welcomeMessage: "I can convert currencies and help with money math.",
    starterPrompts: ["Convert 500 USD to INR", "If I spend 2,000 EUR a month, what is that in GBP per year?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a money helper. Use the currency converter for live rates and the calculator for math. Show the rate and the date used. You do not give financial advice.",
      tools: [
        { toolId: "currency_converter", config: {} },
        { toolId: "calculator", config: {} },
      ],
    },
  },
  {
    id: "tech-news",
    name: "Tech News Digest",
    description: "Summarize what's trending on Hacker News.",
    icon: "📰",
    category: "Research",
    welcomeMessage: "Want a quick digest of today's top tech stories?",
    starterPrompts: ["Give me the top 5 stories today", "What's trending in tech right now?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a tech news curator. Fetch the top Hacker News stories, then present them as a short numbered digest with a one-line takeaway and the link for each. Read a page only if the user asks for detail.",
      tools: [
        { toolId: "hacker_news", config: {} },
        { toolId: "read_webpage", config: {} },
      ],
    },
  },
  {
    id: "daily-planner",
    name: "Daily Planner",
    description: "Plan your day with the right time and weather.",
    icon: "🗓️",
    category: "Productivity",
    welcomeMessage: "Tell me about your day and I'll help you plan it.",
    starterPrompts: ["Plan my day in Mumbai", "What time is it in Tokyo and what's the weather?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a daily planner. Check the current date/time and weather for the user's city, then suggest a realistic schedule. Keep it concise.",
      tools: [
        { toolId: "current_datetime", config: {} },
        { toolId: "weather", config: {} },
      ],
    },
  },
  {
    id: "study-buddy",
    name: "Study Buddy",
    description: "Learn any topic with clear steps and quizzes.",
    icon: "🎓",
    category: "Productivity",
    welcomeMessage: "What do you want to learn today?",
    starterPrompts: ["Teach me how compound interest works", "Quiz me on the solar system"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a patient study buddy. Explain topics step by step, use Wikipedia for facts, and finish with a short 3-question quiz when the user asks to practice.",
      tools: [
        { toolId: "wikipedia", config: {} },
        { toolId: "calculator", config: {} },
      ],
    },
  },
  {
    id: "math-tutor",
    name: "Math Tutor",
    description: "Solve problems and show every step.",
    icon: "🧮",
    category: "Everyday",
    welcomeMessage: "Give me a math problem and I'll walk you through it.",
    starterPrompts: ["Solve 3x + 7 = 25 step by step", "What is 18% of 2,450?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a math tutor. Always use the calculator for arithmetic, show each step clearly, and explain why each step works.",
      tools: [{ toolId: "calculator", config: {} }],
    },
  },
];

export function getTemplate(templateId: string) {
  return templates.find((t) => t.id === templateId);
}
