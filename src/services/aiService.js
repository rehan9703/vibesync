/**
 * VibeSync AI Service Layer
 * Supports multiple providers: OpenAI, Anthropic, Google Gemini, DeepSeek, Groq, etc.
 * Beast Mode: Integrated with VibeKnowledgeBase for auto-augmented prompts.
 */
import { matchAndAugmentPrompt, buildAugmentedContext } from './vibeKnowledgeBase';

export const PROVIDERS = {
  ANTHROPIC: {
    id: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: {
      speed: 'claude-3-haiku-20240307',
      power: 'claude-3-5-sonnet-20240620'
    }
  },
  OPENAI: {
    id: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: {
      speed: 'gpt-4o-mini',
      power: 'gpt-4o'
    }
  },
  GEMINI: {
    id: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      speed: 'gemini-1.5-flash-latest',
      power: 'gemini-1.5-pro-latest'
    }
  },
  DEEPSEEK: {
    id: 'deepseek',
    endpoint: 'https://api.deepseek.com/chat/completions',
    models: {
      speed: 'deepseek-chat',
      power: 'deepseek-reasoner'
    }
  },
  GROQ: {
    id: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: {
      speed: 'llama-3.1-8b-instant',
      power: 'llama-3.3-70b-versatile'
    }
  },
  MISTRAL: {
    id: 'mistral',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    models: {
      speed: 'mistral-small-latest',
      power: 'mistral-large-latest'
    }
  },
  COHERE: {
    id: 'cohere',
    endpoint: 'https://api.cohere.ai/v1/chat',
    models: {
      speed: 'command-r',
      power: 'command-r-plus'
    }
  },
  XAI: {
    id: 'xai',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    models: {
      speed: 'grok-beta',
      power: 'grok-beta'
    }
  },
  PERPLEXITY: {
    id: 'perplexity',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    models: {
      speed: 'llama-3.1-8b-instruct',
      power: 'llama-3.1-70b-instruct'
    }
  },
  TOGETHER: {
    id: 'together',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    models: {
      speed: 'meta-llama/Llama-3-8b-chat-hf',
      power: 'meta-llama/Llama-3.3-70b-instruct-turbo'
    }
  },
  FIREWORKS: {
    id: 'fireworks',
    endpoint: 'https://api.fireworks.ai/inference/v1/chat/completions',
    models: {
      speed: 'accounts/fireworks/models/llama-v3-8b-instruct',
      power: 'accounts/fireworks/models/llama-v3p3-70b-instruct'
    }
  },
  OPENROUTER: {
    id: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: {
      speed: 'openrouter/auto',
      power: 'anthropic/claude-3.5-sonnet'
    }
  },
  // ─── Local AI Providers (OpenAI-compatible APIs) ───
  OLLAMA: {
    id: 'ollama',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    models: {
      speed: 'llama3.2',
      power: 'llama3.1:70b'
    }
  },
  LMSTUDIO: {
    id: 'lmstudio',
    endpoint: 'http://localhost:1234/v1/chat/completions',
    models: {
      speed: 'local-model',
      power: 'local-model'
    }
  },
  JAN: {
    id: 'jan',
    endpoint: 'http://localhost:1337/v1/chat/completions',
    models: {
      speed: 'local-model',
      power: 'local-model'
    }
  },
  LOCALAI: {
    id: 'localai',
    endpoint: 'http://localhost:8080/v1/chat/completions',
    models: {
      speed: 'gpt-3.5-turbo',
      power: 'gpt-4'
    }
  }
};

const SYSTEM_PROMPT = `
You are a World-class Senior Software Architect and Vibe Coding Prompt Engineer.
Your task is to analyze an app idea and the person building it, and produce a deeply detailed, 
personalized, production-ready prompt.

Your output MUST be structured into exactly these 10 sections:
1. PROJECT OVERVIEW: App name, tagline, problem solved, success metrics.
2. USER PERSONAS: 2-3 specific profiles with backgrounds and pain points.
3. TECH STACK: Specific library names, versions, APIs, DB schema, Auth, Hosting.
4. PROJECT STRUCTURE: A complete folder and file tree.
5. SCREENS & FLOW: Every page needed, their content, and build order.
6. FEATURES: Breakdown of each feature with implementation hints and edge cases.
7. DESIGN SYSTEM: Hex codes, font pairings, spacing, and animation guidelines.
8. MONETIZATION: Detailed revenue model implementation and paywall placement.
9. BUILD ORDER: Step-by-step sequence starting from MVP.
10. PITFALLS TO AVOID: Common mistakes, performance tips, and security basics.

Avoid generic templates. Tailor the technical depth to the user's experience level.
`;

export const MODEL_LISTS = {
  ANTHROPIC: [
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', type: 'power' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', type: 'power' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', type: 'speed' }
  ],
  OPENAI: [
    { id: 'gpt-4o', name: 'GPT-4o (Omni)', type: 'power' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'speed' },
    { id: 'o1-preview', name: 'o1 Preview (Reasoning)', type: 'power' },
    { id: 'o1-mini', name: 'o1 Mini', type: 'speed' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'power' }
  ],
  GEMINI: [
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', type: 'power' },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', type: 'speed' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', type: 'legacy' }
  ],
  DEEPSEEK: [
    { id: 'deepseek-chat', name: 'DeepSeek V3', type: 'power' },
    { id: 'deepseek-reasoner', name: 'DeepSeek R1', type: 'power' }
  ],
  GROQ: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', type: 'power' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', type: 'speed' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', type: 'power' }
  ],
  MISTRAL: [
    { id: 'mistral-large-latest', name: 'Mistral Large', type: 'power' },
    { id: 'mistral-medium-latest', name: 'Mistral Medium', type: 'power' },
    { id: 'mistral-small-latest', name: 'Mistral Small', type: 'speed' }
  ],
  COHERE: [
    { id: 'command-r-plus', name: 'Command R+', type: 'power' },
    { id: 'command-r', name: 'Command R', type: 'speed' }
  ],
  XAI: [
    { id: 'grok-beta', name: 'Grok Beta', type: 'power' }
  ],
  PERPLEXITY: [
    { id: 'llama-3.1-70b-instruct', name: 'Sonar Llama 70B', type: 'power' },
    { id: 'llama-3.1-8b-instruct', name: 'Sonar Llama 8B', type: 'speed' }
  ],
  TOGETHER: [
    { id: 'meta-llama/Llama-3.3-70b-instruct-turbo', name: 'Llama 3.3 70B Turbo', type: 'power' },
    { id: 'meta-llama/Llama-3-8b-chat-hf', name: 'Llama 3 8B Chat', type: 'speed' }
  ],
  FIREWORKS: [
    { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', name: 'Llama 3.3 70B', type: 'power' },
    { id: 'accounts/fireworks/models/llama-v3-8b-instruct', name: 'Llama 3 8B', type: 'speed' }
  ],
  OPENROUTER: [
    { id: 'openai/gpt-4o', name: 'GPT-4o (via OR)', type: 'power' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (via OR)', type: 'speed' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (via OR)', type: 'power' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (via OR)', type: 'speed' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro (via OR)', type: 'power' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B (via OR)', type: 'power' },
    { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B (via OR)', type: 'speed' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (via OR)', type: 'power' },
    { id: 'openrouter/auto', name: '⚡ Auto (Best Price/Speed)', type: 'speed' }
  ],
  OLLAMA: [
    { id: 'llama3.2', name: 'Llama 3.2 (3B)', type: 'speed' },
    { id: 'llama3.2:1b', name: 'Llama 3.2 (1B)', type: 'speed' },
    { id: 'llama3.1', name: 'Llama 3.1 (8B)', type: 'power' },
    { id: 'llama3.1:70b', name: 'Llama 3.1 (70B)', type: 'power' },
    { id: 'mistral', name: 'Mistral 7B', type: 'power' },
    { id: 'mistral-nemo', name: 'Mistral Nemo 12B', type: 'power' },
    { id: 'codellama', name: 'Code Llama', type: 'power' },
    { id: 'codellama:34b', name: 'Code Llama 34B', type: 'power' },
    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', type: 'power' },
    { id: 'phi3', name: 'Phi-3 Mini', type: 'speed' },
    { id: 'phi3:medium', name: 'Phi-3 Medium', type: 'power' },
    { id: 'gemma2', name: 'Gemma 2 (9B)', type: 'power' },
    { id: 'gemma2:27b', name: 'Gemma 2 (27B)', type: 'power' },
    { id: 'qwen2.5', name: 'Qwen 2.5 (7B)', type: 'power' },
    { id: 'qwen2.5:72b', name: 'Qwen 2.5 (72B)', type: 'power' },
    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', type: 'power' },
    { id: 'mixtral', name: 'Mixtral 8x7B', type: 'power' },
    { id: 'neural-chat', name: 'Neural Chat 7B', type: 'speed' },
    { id: 'starling-lm', name: 'Starling LM 7B', type: 'speed' }
  ],
  LMSTUDIO: [
    { id: 'local-model', name: 'Loaded Model (auto)', type: 'power' }
  ],
  JAN: [
    { id: 'local-model', name: 'Loaded Model (auto)', type: 'power' }
  ],
  LOCALAI: [
    { id: 'gpt-3.5-turbo', name: 'Local GPT-3.5', type: 'speed' },
    { id: 'gpt-4', name: 'Local GPT-4', type: 'power' }
  ]
};

export const conductAIRequest = async (provider, apiKey, userPrompt, isSuggestion = false, customModel = null) => {
  if (!apiKey) throw new Error("API Key is missing for " + provider);

  const headers = {
    'Content-Type': 'application/json',
  };

  const providerConfig = PROVIDERS[provider.toUpperCase()];
  // Use customModel if provided, else use speed for suggestions or power for blueprints
  const modelToUse = customModel || (isSuggestion ? providerConfig.models.speed : providerConfig.models.power);
  
  let body = {};

  switch (provider) {
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['dangerously-allow-browser'] = 'true';
      body = {
        model: modelToUse,
        max_tokens: 4000,
        system: isSuggestion 
          ? "You are a creative naming and marketing assistant. Reply ONLY with a comma-separated list of items. NO preamble. NO chatter. NO numbering. NO markdown formatting. Just the items separated by commas." 
          : SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      };
      break;

    case 'openai':
    case 'groq':
    case 'mistral':
    case 'deepseek':
    case 'xai':
    case 'perplexity':
    case 'together':
    case 'fireworks':
    case 'openrouter':
    // ─── Local AI (all use OpenAI-compatible format, no auth needed) ───
    case 'ollama':
    case 'lmstudio':
    case 'jan':
    case 'localai': {
      // Local providers don't need auth header (or use 'ollama' as dummy key)
      const isLocal = ['ollama','lmstudio','jan','localai'].includes(provider);
      if (!isLocal) headers['Authorization'] = `Bearer ${apiKey}`;
      // For OpenRouter, include app info headers
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://promptforge.app';
        headers['X-Title'] = 'VibeSync';
      }
      // For local providers, use the saved custom endpoint if available
      let customEndpoint = null;
      if (isLocal) {
        const savedConfig = localStorage.getItem(`promptforge_localconfig_${provider}`);
        if (savedConfig) {
          const cfg = JSON.parse(savedConfig);
          if (cfg.endpoint) customEndpoint = cfg.endpoint;
        }
      }
      body = {
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: isSuggestion
              ? 'You are a creative assistant. Reply ONLY with a comma-separated list. NO chatter. NO numbering. NO markdown. Just items separated by commas.'
              : SYSTEM_PROMPT
          },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: isSuggestion ? 200 : 8000,
        temperature: isSuggestion ? 0.9 : 0.7,
        stream: false
      };
      // Use custom endpoint for local or configured endpoint
      const useEndpoint = customEndpoint || providerConfig.endpoint;
      const localResponse = await fetch(useEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!localResponse.ok) {
        const errData = await localResponse.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.message || `${provider} API Request Failed (${localResponse.status})`);
      }
      const localData = await localResponse.json();
      return localData.choices?.[0]?.message?.content || localData.choices?.[0]?.text || JSON.stringify(localData);
    }

    case 'gemini':
      const tryGemini = async (model) => {
        const url = `${providerConfig.endpoint}/${model}:generateContent?key=${apiKey}`;
        const geminiBody = {
          contents: [{ parts: [{ text: isSuggestion ? userPrompt : `${SYSTEM_PROMPT}\n\nUSER DATA:\n${userPrompt}` }] }]
        };
        return fetchGemini(url, geminiBody);
      };

      try {
        return await tryGemini(modelToUse);
      } catch (err) {
        // Fallback to 1.0 pro if 1.5 fails
        if (modelToUse.includes('1.5')) {
          console.warn("Gemini 1.5 failed, trying 1.0-pro fallback...");
          return await tryGemini('gemini-1.0-pro');
        }
        throw err;
      }

    case 'cohere':
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = {
        model: modelToUse,
        message: isSuggestion ? `Reply ONLY with a comma-separated list: ${userPrompt}` : userPrompt,
        preamble: isSuggestion ? "" : SYSTEM_PROMPT
      };
      break;

    default:
      throw new Error("Unsupported provider: " + provider);
  }

  const endpoint = providerConfig.endpoint;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || errorData.message || "API Request Failed");
  }

  const data = await response.json();
  
  if (provider === 'anthropic') return data.content[0].text;
  if (provider === 'cohere') return data.text;
  // All others (including local) handled inline above
  return data.choices?.[0]?.message?.content || data;
};

const fetchGemini = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    const errorMsg = data.error?.message || "Gemini API Request Failed";
    throw new Error(errorMsg);
  }
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Gemini returned no results. Check if your prompt violates safety guidelines.");
  }

  return data.candidates[0].content.parts[0].text;
};

export const VIBE_STYLES = {
  technical: "accurate, precise, and domain-specific terminology; formal and objective tone; structured explanation of methods or calculations; and appropriate use of symbols, units, or formulas.",
  formal: "polished, professional, and respectful tone; avoids slang; clear and concise structure.",
  simple: "clear, basic, and easy to understand; uses simple words and short sentences.",
  academic: "evidence-based, structured, and citation-aware; suitable for research and academic contexts.",
  creative: "original, imaginative, and artistic; uses rich metaphors and expressive language.",
  humorous: "light-hearted, witty, and entertaining; uses wordplay or sarcasm appropriately.",
  minimalist: "concise, essential, and clean; avoids fluff and focuses on core value."
};

export const VIBE_AUDIENCES = {
  developers: "software developers and engineers; include implementation details, code examples, architecture patterns, best practices, and performance considerations.",
  experts: "domain specialists; use advanced jargon, deep insights, and complex conceptual links.",
  beginners: "new learners; use simple explanations, foundational concepts, and clear analogies.",
  business: "business stakeholders; focus on strategy, ROI, market perspective, and practical outcomes.",
  general: "general audience; balanced tone, non-specialized language, and broad relatability."
};

export const generateAppPrompt = (data, vibeStyle = 'technical', vibeAudience = 'developers') => {
  const styleInstruction = VIBE_STYLES[vibeStyle] || VIBE_STYLES.technical;
  const audienceInstruction = VIBE_AUDIENCES[vibeAudience] || VIBE_AUDIENCES.developers;

  // ── BEAST MODE: Auto-match user data to elite engineering knowledge ──
  const augmentations = matchAndAugmentPrompt(data, vibeStyle, vibeAudience);
  const beastModeContext = buildAugmentedContext(augmentations);

  return `
Act as a World-Class Senior Full-Stack Architect and Lead Engineer. You are also a master Vibe Coder.
Your goal is to generate the ULTIMATE "ALL-IN-ONE MASTER BLUEPRINT" for a complete full-stack application.
This blueprint must be so detailed and precise that a team of developer AIs (Cursor, Bolt, v0, etc.) can build the ENTIRE app from it with zero ambiguity.

### 🎨 VIBE & COMMUNICATION STYLE:
- WRITING STYLE: ${styleInstruction}
- TARGET READER: ${audienceInstruction}

### 📟 PROJECT CORE:
- App Name: **${data.appName}**
- Tagline: _${data.tagline}_
- My Role: ${data.role} (${data.experience} level)
- My Goal: ${data.goal}
- Timeline: ${data.timeline}

### 📝 DESCRIPTION:
${data.description}

### 🛠️ STACK & PLATFORM:
- Platform: ${data.platform}
- Tech Stack: ${data.stack}
- Monetization Model: ${data.monetization}
- Budget/Ops Context: ${data.budget}

### 🎨 VISUAL DESIGN INTENT:
- UI Style: ${data.uiStyle}
- Color Theme: ${data.colorTheme}
- Extra Constraints: ${data.extraContext}

### ✨ SELECTED FEATURES (all must have implementation details):
${(data.features || []).map(f => `- ${f}`).join('\n')}
${beastModeContext}
### 📋 OUTPUT REQUIREMENTS — MANDATORY 12 GOD-LEVEL SECTIONS:

1. **🚀 Executive Overview**
   - Problem statement, unique value proposition, success metrics (KPIs), and target market. No fluff.

2. **👤 Target Personas & User Journeys**
   - Define exact user flows. Step-by-step click paths for the 3 most critical operations.

3. **🏗️ Full-Stack Architecture & Infrastructure**
   - A detailed Mermaid.js flowchart mapping Client → API Gateway/CDN → Backend Services → Databases → External APIs (Stripe, AI, etc.).

4. **⚙️ Tech Stack & Concrete Dependencies**
   - List EXACT framework versions, UI libraries (e.g., shadcn/ui, Tailwind v4), state management, ORMs (e.g., Prisma, Drizzle), validation (Zod), and testing suites. Do not use generic terms like "a database". Specify "PostgreSQL 16 via Neon.tech".

5. **🗄️ Database Schema & Data Models**
   - EXHAUSTIVE table definitions. Field names, strict types, constraints (UNIQUE, NOT NULL), Foreign Keys, and indexing strategies. Provide a visual ER diagram in Mermaid.js.

6. **📡 API Specifications & Data Contracts**
   - Define ALL core endpoints. Method, exact URL path, required Auth headers, strict JSON Request body schemas (with Zod definitions), and Response schemas (success + specific error codes).

7. **🔩 Core Feature Deep-Dive (Zero Ambiguity)**
   - Take the 3 most complex features. Write the exact architectural approach, edge cases (e.g., "what happens if the webhook fails?"), and pseudo-code algorithm flows.

8. **🎨 Design System & Vibe Translation**
   - Translate the requested Vibe into exact CSS root variables: Primary/Secondary Hex codes, HSL mappings for dark/light mode, typography scales (font-family, rem sizes), spacing scales, and specific cubic-bezier animation curves.

9. **📁 Exhaustive File Structure & Component Tree**
   - Provide a complete monorepo or standard app tree (e.g., \`src/app\`, \`src/components\`, \`src/lib\`). Name every file, utility, custom hook, and server action needed for the MVP.

10. **💰 Monetization & Paywall Implementation**
    - Exactly where and how the paywall intercepts the user journey. Stripe product structure mapping and webhook handling strategy.

11. **🛠️ Build Order & MVP Step-by-Step Execution**
    - A rigorously ordered, atomic task list. From \`git init\` to deployment. Every step must be a single, testable chunk of work that an AI coding agent can execute without asking questions.

12. **🚨 Security, Performance & Pitfalls**
    - Provide a strict audit checklist. Caching layers (Redis), DB connection pooling, rate limiting thresholds, precise RBAC logic, and common security misconfigurations to avoid.

---
**CRITICAL RULES FOR THE AI CONDUCTOR:**
- **BE EXPLICIT:** Use exact library names, versions, and variable names. Formulate real SQL schemas. Write valid Mermaid syntax.
- **ZERO HALLUCINATION:** If it's a structural decision, make the best choice and defend it. Do not say "you could use X or Y". Say "Use X because Y".
- **COPILOT-READY FORMAT:** This document will be fed into coding agents (Cursor, Bolt, Windsurf). It MUST be formatted beautifully in deeply nested Markdown so AI context windows can parse it perfectly. Use emojis for headers.
- **NO MISTAKES:** Anticipate edge cases. Build in resilience. Leave nothing to imagination.
`;
};
