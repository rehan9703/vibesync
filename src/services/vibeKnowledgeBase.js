/**
 * VibeKnowledgeBase.js
 * Beast Mode Prompt Augmentation Engine
 * 
 * Inspired by:
 *   - vibeprompt (MohammedAly22) - Style & Audience transformation logic
 *   - vibecoding (cpjet64)       - Vibe-Translation, Prompt Engineering, AI Orchestration
 * 
 * This engine automatically analyzes user project data, matches it against a rich
 * knowledge base of elite engineering principles, and injects tailored directives
 * to produce BEAST-level full-stack prompts.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: VIBE AESTHETIC REGISTRY (from vibecoding/vibe-translation-guide.md)
// ─────────────────────────────────────────────────────────────────────────────
export const VIBE_AESTHETICS = {
  cyberpunk: {
    label: '🤖 Cyberpunk',
    description: 'High-tech dystopia — neon accents, dark backgrounds, terminal UIs',
    cssDirectives: `
      - Background: #0c0c0c with rgba(0,243,255,0.05) overlay
      - Primary Accent: #00f3ff (Cyan Neon) | Secondary: #fd015b (Magenta)
      - Font: 'Rajdhani' for headings, 'Space Mono' for body/code
      - Borders: 1px solid rgba(0,243,255,0.3) with box-shadow: 0 0 10px rgba(0,243,255,0.3)
      - Buttons: clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%) for angular feel
      - Animations: glitch effects, digital scan lines, 0.2s cubic-bezier transitions
      - Overall feel: High information density, industrial, slightly chaotic but precise`,
    architectureHints: `
      - Prefer microservices or modular monolith for scalability
      - Use WebSockets for real-time data streams and live dashboards
      - Implement dark-mode-first design system with neon accent variables
      - Redis for caching; PostgreSQL for structured data`
  },
  vaporwave: {
    label: '🌅 Vaporwave',
    description: 'Nostalgic retrofuturism — pastels, 80s gradients, dreamlike',
    cssDirectives: `
      - Background: linear-gradient(to bottom, #ff6ad5, #c774e8, #ad8cff)
      - Primary Accent: #FF6AD5 (Pink) | Secondary: #94D0FF (Ice Blue)
      - Font: 'VCR OSD Mono' or 'Press Start 2P' for headings
      - Cards: border: 1px solid rgba(255,255,255,0.2), backdrop-filter: blur(10px)
      - Glow: box-shadow: 0 0 15px rgba(255, 166, 158, 0.5)
      - Animations: slow fade-ins (0.8s), dreamy ease-out transitions, subtle float
      - Overall feel: Nostalgic, ethereal, slightly distorted but beautiful`,
    architectureHints: `
      - Favor static-first builds (Next.js SSG) for the nostalgic, simple aesthetic
      - Prioritize smooth page transitions with Framer Motion or GSAP
      - Use pastel-driven design tokens; avoid harsh shadows
      - LocalStorage or IndexedDB for client-side persistence`
  },
  lofi: {
    label: '☕ Lo-Fi',
    description: 'Comfortable imperfection — muted tones, warm textures, calm productivity',
    cssDirectives: `
      - Background: #f2f0e6 (warm cream) | Dark mode: #1a1814
      - Primary Accent: #d4a373 (warm amber) | Secondary: #a8c5a0 (sage green)
      - Font: 'Space Mono' or 'Caveat' for an organic, handwritten feel
      - Cards: border-radius: 8px, box-shadow: 4px 4px 0px #333, background: #fff
      - Textures: subtle noise overlays (opacity: 0.05) for an analog feel
      - Animations: minimal — only gentle fade-ins, no bounce or glitch
      - Overall feel: Calm, natural, distraction-free, approachable`,
    architectureHints: `
      - Prefer a monolithic architecture for simplicity and reduced operational overhead
      - Use server-side rendering for fast initial loads; prioritize Core Web Vitals
      - Implement gentle, accessible micro-interactions using CSS transitions only
      - SQLite or simple JSON-file storage for small-scale apps`
  },
  brutalist: {
    label: '🧱 Brutalism',
    description: 'Raw, honest design — exposed structure, bold typography, no decoration',
    cssDirectives: `
      - Background: #ffffff | Dark: #000000 — no gradients, just raw color
      - Primary Accent: #ff0000 (pure red) or #0000ff (pure blue) — uncompromising
      - Font: 'Arial Black', 'Impact', or 'Courier New' — system fonts only
      - Borders: 3-5px solid #000; avoid border-radius entirely
      - Shadows: box-shadow: 5px 5px 0 #000 — hard offset, no blur
      - Layout: Break the grid intentionally. Overlapping, asymmetric layouts.
      - Overall feel: Confrontational, honest, memorable, anti-aesthetic aesthetic`,
    architectureHints: `
      - Prioritize function over form — clean APIs, minimal JavaScript
      - Use SSR for performance; accessibility is paramount
      - Avoid heavy dependencies; raw HTML, CSS, and vanilla JS where possible`
  },
  glassmorphism: {
    label: '🪟 Glassmorphism',
    description: 'Frosted glass, blurred backgrounds, premium depth — the modern elite',
    cssDirectives: `
      - Background: Semi-transparent overlays on vibrant gradient backgrounds
      - Cards: background: rgba(255,255,255,0.1), backdrop-filter: blur(20px), border: 1px solid rgba(255,255,255,0.2)
      - Accent: Vibrant HSL colors (hsl(220, 90%, 60%)) against blurred backgrounds
      - Font: 'Inter' or 'SF Pro' — clean, modern, weights 300-700
      - Depth: Multiple layered translucent cards creating visual hierarchy
      - Animations: Smooth 0.4s ease-out on all interactions; subtle scale(1.02) on hover
      - Overall feel: Premium, modern, airy, luxurious`,
    architectureHints: `
      - Next.js or React with Framer Motion for silky smooth transitions
      - Use CSS custom properties for your entire glass design system
      - Prioritize performance — backdrop-filter is GPU intensive, use sparingly
      - Dark backgrounds with vibrant accent colors work best`
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: FEATURE-TO-ENGINEERING MATCHER
// Maps user-selected features → specific architecture patterns & libraries
// (Inspired by vibecoding/ai-orchestration-patterns.md)
// ─────────────────────────────────────────────────────────────────────────────
const FEATURE_ENGINEERING_MAP = {
  // Real-time features
  'Real-time Chat': {
    patterns: ['WebSocket (Socket.io)', 'Pub/Sub with Redis', 'CRDT for conflict resolution'],
    libraries: ['socket.io', 'ably', 'pusher'],
    dbHints: 'Use NoSQL (MongoDB) for flexible message schemas; add TTL indexes for message expiry',
    securityHints: 'Implement message sanitization (DOMPurify), rate limiting per user, and room-based auth'
  },
  'Live Notifications': {
    patterns: ['Server-Sent Events (SSE)', 'WebSocket streams', 'Polling fallback'],
    libraries: ['EventSource API', 'socket.io', 'novu'],
    dbHints: 'Notification table with read/unread status, userId FK, and composite index on (userId, createdAt)',
    securityHints: 'Never expose raw user IDs in notification payloads; use opaque tokens'
  },
  // Auth & Identity
  'User Authentication': {
    patterns: ['JWT + Refresh Token Rotation', 'OAuth 2.0 with PKCE', 'Session-based Auth'],
    libraries: ['next-auth', 'clerk', 'passport.js', 'lucia'],
    dbHints: 'Users table: id, email, passwordHash (bcrypt cost 12), emailVerified, createdAt. Add index on email.',
    securityHints: 'Store refresh tokens hashed in DB. Use HttpOnly cookies. Implement CSRF protection.'
  },
  'Social Login': {
    patterns: ['OAuth 2.0 Authorization Code Flow', 'OpenID Connect'],
    libraries: ['next-auth providers', 'oauth2-client', 'firebase auth'],
    dbHints: 'Add accounts table: userId, provider, providerAccountId, access_token, refresh_token',
    securityHints: 'Always verify state parameter to prevent CSRF. Store tokens server-side only.'
  },
  // Payments
  'Payments / Subscriptions': {
    patterns: ['Stripe Checkout', 'Subscription lifecycle management', 'Webhook handling'],
    libraries: ['stripe/stripe-js', 'stripe (Node.js)', 'lemon-squeezy'],
    dbHints: 'subscriptions table: id, userId, stripeCustomerId, stripePriceId, status, currentPeriodEnd',
    securityHints: 'ALWAYS verify Stripe webhook signatures. Never trust client-side payment confirmation.'
  },
  // Data & Search
  'Advanced Search': {
    patterns: ['Full-text search with ranking', 'Faceted filtering', 'Vector search for AI'],
    libraries: ['algolia', 'meilisearch', 'elasticsearch', 'pgvector'],
    dbHints: 'Add GIN index on search fields in PostgreSQL. Consider a dedicated search service for scale.',
    securityHints: 'Sanitize all search inputs. Implement rate limiting on search endpoints.'
  },
  'File Uploads': {
    patterns: ['Presigned URL uploads to S3', 'Multipart upload for large files', 'Image optimization pipeline'],
    libraries: ['aws-sdk/client-s3', 'uploadthing', 'cloudinary'],
    dbHints: 'files table: id, userId, s3Key, filename, mimeType, sizeBytes, uploadedAt',
    securityHints: 'Validate file types server-side (not just by extension). Enforce max file size. Scan for malware for user-uploaded content.'
  },
  // AI Features
  'AI Chat': {
    patterns: ['Streaming responses via Server-Sent Events', 'RAG (Retrieval-Augmented Generation)', 'Conversation history management'],
    libraries: ['openai/stream', 'langchain', 'vercel/ai-sdk'],
    dbHints: 'conversations table + messages table with role (user/assistant), content, tokenCount',
    securityHints: 'Implement content filtering. Rate limit AI calls per user. Never expose API keys client-side.'
  },
  'AI Analysis': {
    patterns: ['Async job queue for heavy AI tasks', 'Structured output parsing', 'Model fallback chains'],
    libraries: ['bull/bullmq', 'inngest', 'zod (for structured output)'],
    dbHints: 'jobs table: id, userId, status (pending/processing/done/failed), result, createdAt',
    securityHints: 'Validate and sanitize all AI-generated content before storing or displaying.'
  },
  // Admin & Analytics
  'Admin Dashboard': {
    patterns: ['Role-Based Access Control (RBAC)', 'Audit logging', 'Soft deletes'],
    libraries: ['react-admin', 'refine', 'data-table (shadcn)'],
    dbHints: 'roles table + userRoles junction. audit_logs: userId, action, resource, resourceId, timestamp',
    securityHints: 'Use middleware to enforce RBAC on every API route. Never infer roles from client data.'
  },
  'Analytics': {
    patterns: ['Event tracking pipeline', 'Aggregation with materialized views', 'Time-series data'],
    libraries: ['posthog', 'mixpanel', 'plausible', 'clickhouse'],
    dbHints: 'events table: id, userId, eventName, properties (JSONB), timestamp. Index on (eventName, timestamp).',
    securityHints: 'Anonymize PII in analytics. Respect user consent and GDPR/CCPA.'
  },
  // PWA & Mobile
  'PWA / Offline Mode': {
    patterns: ['Service Worker with Workbox', 'Cache-first strategies', 'Background sync'],
    libraries: ['workbox', 'vite-plugin-pwa'],
    dbHints: 'IndexedDB for offline-first data sync. Implement conflict resolution on sync.',
    securityHints: 'Secure Service Worker scope. Cache only public assets. Never cache auth tokens in SW.'
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: PLATFORM-TO-ARCHITECTURE MATCHER
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_ARCHITECTURE_MAP = {
  'Web App': {
    recommendation: 'Next.js (App Router) for SSR + ISR + API Routes in one framework. Deploy on Vercel.',
    infrastructure: 'Vercel (frontend) + Railway/Render (backend services) + Neon/Supabase (PostgreSQL)'
  },
  'Mobile App': {
    recommendation: 'React Native with Expo for cross-platform iOS/Android. Use Expo Router for navigation.',
    infrastructure: 'EAS Build (Expo) + Railway (backend API) + Supabase (auth + DB)'
  },
  'Desktop App': {
    recommendation: 'Tauri (Rust + Web) for performance, or Electron with Vite for broader ecosystem.',
    infrastructure: 'GitHub Actions for CI/CD packaging + GitHub Releases for distribution'
  },
  'Full-Stack Web': {
    recommendation: 'Next.js Monorepo with Turborepo. Separate `apps/web` and `apps/api` with shared `packages/ui`.',
    infrastructure: 'Vercel (web) + Railway (API containers) + PlanetScale/Neon (DB) + Cloudflare R2 (storage)'
  },
  'SaaS': {
    recommendation: 'Next.js + Stripe + Clerk/Auth0 for the classic SaaS stack. Multi-tenancy from day one.',
    infrastructure: 'Vercel + Fly.io (isolated worker services) + Supabase (per-tenant schemas) + Stripe'
  },
  'AI Tool': {
    recommendation: 'Next.js with Vercel AI SDK for streaming, plus a Python FastAPI backend for heavy ML tasks.',
    infrastructure: 'Vercel (Next.js) + Modal.com/Replicate (GPU inference) + Pinecone/pgvector (embeddings)'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: EXPERIENCE-LEVEL GUIDANCE (from vibeprompt audience adaptation)
// ─────────────────────────────────────────────────────────────────────────────
const EXPERIENCE_DEPTH_MAP = {
  beginner: {
    codingStyle: 'Write every component as a simple, self-contained function. Avoid abstractions. Add comments on every non-trivial line.',
    architectureDepth: 'Keep the architecture flat — a single Next.js app with pages router and API routes. No microservices.',
    pitfalls: 'Warn about: forgetting to add .env to .gitignore, not using environment variables for secrets, hardcoding colors instead of using variables.'
  },
  intermediate: {
    codingStyle: 'Use custom hooks for logic separation. Implement basic error boundaries. Use TypeScript with inferrable types.',
    architectureDepth: 'Introduce a service layer for API calls. Separate business logic from UI. Consider a simple MVC pattern.',
    pitfalls: 'Warn about: prop drilling, N+1 queries, missing loading/error states, and client-side over-fetching.'
  },
  advanced: {
    codingStyle: 'Strict TypeScript. Repository pattern + Domain services. Feature-sliced design or similar modular architecture.',
    architectureDepth: 'Design for scalability from the start. Include caching strategy (Redis), rate limiting, and observability (logs, metrics, traces).',
    pitfalls: 'Warn about: distributed systems pitfalls (split-brain, CAP theorem), cache invalidation strategies, and security misconfiguration.'
  },
  expert: {
    codingStyle: 'DDD (Domain-Driven Design). Hexagonal architecture. Full observability (OTel traces, structured JSON logs).',
    architectureDepth: 'Include decisions on: Service mesh vs. direct HTTP, Event sourcing considerations, Multi-region deployment strategy.',
    pitfalls: 'Warn about: premature optimization, over-engineering, vendor lock-in, and the cost of eventual consistency.'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: THE BEAST MODE MATCHER ENGINE
// Core function: takes user data, returns an augmentation payload
// ─────────────────────────────────────────────────────────────────────────────
export const matchAndAugmentPrompt = (data, vibeStyle = 'technical', vibeAudience = 'developers') => {
  const augmentations = {
    featureInsights: [],
    platformGuidance: '',
    experienceGuidance: null,
    aestheticDirectives: '',
    orchestrationPrinciples: '',
    safetyChecklist: '',
    beastModeActivated: false
  };

  // --- 1. Feature Matching ---
  if (data.features && Array.isArray(data.features)) {
    data.features.forEach(feature => {
      // Match full or partial feature names
      const matchedKey = Object.keys(FEATURE_ENGINEERING_MAP).find(key =>
        feature.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(feature.toLowerCase())
      );
      if (matchedKey) {
        augmentations.featureInsights.push({
          feature: matchedKey,
          ...FEATURE_ENGINEERING_MAP[matchedKey]
        });
        augmentations.beastModeActivated = true;
      }
    });
  }

  // --- 2. Platform Matching ---
  if (data.platform) {
    const matchedPlatform = Object.keys(PLATFORM_ARCHITECTURE_MAP).find(key =>
      data.platform.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(data.platform.toLowerCase())
    );
    if (matchedPlatform) {
      augmentations.platformGuidance = PLATFORM_ARCHITECTURE_MAP[matchedPlatform];
      augmentations.beastModeActivated = true;
    }
  }

  // --- 3. Experience Level Matching ---
  if (data.experience) {
    const expKey = data.experience.toLowerCase();
    const matchedExp = Object.keys(EXPERIENCE_DEPTH_MAP).find(k => expKey.includes(k));
    if (matchedExp) {
      augmentations.experienceGuidance = EXPERIENCE_DEPTH_MAP[matchedExp];
      augmentations.beastModeActivated = true;
    }
  }

  // --- 4. UI Style / Aesthetic Matching ---
  if (data.uiStyle || data.colorTheme) {
    const uiSearch = `${data.uiStyle} ${data.colorTheme}`.toLowerCase();
    const matchedAesthetic = Object.keys(VIBE_AESTHETICS).find(key => uiSearch.includes(key));
    if (matchedAesthetic) {
      augmentations.aestheticDirectives = VIBE_AESTHETICS[matchedAesthetic];
      augmentations.beastModeActivated = true;
    }
  }

  // --- 5. Orchestration principles (always injected) ---
  // From vibecoding/ai-orchestration-patterns.md & ai-collaboration-workflow.md
  // --- 5. Orchestration principles (always injected) ---
  // From vibecoding/ai-orchestration-patterns.md & ai-collaboration-workflow.md
  augmentations.orchestrationPrinciples = `
### GOD-LEVEL VIBECODING DIRECTIVES
1. **DETERMINISTIC ARCHITECTURE:** Leave absolutely ZERO ambiguity. Every module, folder, database field, API route, error boundary, and CSS token must be explicitly named and defined.
2. **ZERO HALLUCINATION:** Do not suggest generic technologies. Specify the EXACT library version, ORM (Prisma/Drizzle), Auth provider (Clerk/NextAuth), caching strategy (Redis), and deployment target (Vercel/Fly).
3. **PRODUCTION-GRADE SCALABILITY:** Design the app to handle 10,000+ concurrent active users. Build in caching layers, structured logging, distributed tracing (OTel), and robust API error formats.
4. **PERFECT VIBE-TRANSLATION:** Translate the aesthetic into exact CSS properties, exact hex codes (HSL/RGB), typography pairings (header/body font families), micro-interaction timings (e.g., cubic-bezier curves), and layout grid constraints.
5. **EXHAUSTIVE FILE STRUCTURE:** Provide a complete monorepo/app tree down to the utility functions, custom hook filenames, server actions, and middleware.
6. **AI-COPILOT READY FORMAT:** Ensure the output is formatted rigorously in deeply nested Markdown so AI coding agents (like Cursor, Bolt, or Windsurf) can ingest it in one pass without confusion. 
7. **NO MISTAKES, NO ERRORS:** Anticipate edge cases, specify error states & empty states for the UI, define fallback mechanisms, and secure all API routes with strict RBAC, rate limiting, and Zod input validation.
8. **CONTEXT-OBJECTIVE-VIBE-TECHNICAL (COVT):** Use the COVT framework for every component description. (a) Context: Why it exists (b) Objective: What it does (c) Vibe: How it feels (d) Technical: How it's built and its edge cases.
- **Phase the output:** Foundation First → Core Features → Enhancement Layer → Polish.`;

  // --- 6. Security checklist (always injected) ---
  augmentations.safetyChecklist = `
- [ ] Use Zod/Joi schema validation on ALL API inputs and URL parameters
- [ ] Implement robust error boundaries and display user-friendly fallback UIs
- [ ] Never store API keys or secrets client-side; strictly use environment variables
- [ ] Hash all passwords with Argon2 or bcrypt (cost factor ≥ 12)
- [ ] Use parameterized ORM queries (Prisma/Drizzle); absolutely no raw SQL string concatenation
- [ ] Implement distributed rate limiting (Redis) on all public API endpoints and auth routes
- [ ] Set strict security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] Use HTTPS everywhere; force redirect from HTTP
- [ ] Implement proper CORS configuration (whitelist specific origins, no wildcard *)
- [ ] Add idempotency keys for all payment or mutating POST/PUT requests
- [ ] Encrypt PII (Personally Identifiable Information) at rest`;

  return augmentations;
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: FORMAT AUGMENTED CONTEXT FOR PROMPT INJECTION
// ─────────────────────────────────────────────────────────────────────────────
export const buildAugmentedContext = (augmentations) => {
  if (!augmentations.beastModeActivated) return '';

  let context = '\n\n### ⚡ BEAST MODE AUGMENTATION (Auto-injected by VibeKnowledgeBase)\n';
  context += '_This section is automatically generated by matching your project requirements against an elite knowledge base of engineering standards._\n\n';

  if (augmentations.platformGuidance) {
    context += `#### 🏗️ Platform Architecture Recommendation\n`;
    context += `- **Stack**: ${augmentations.platformGuidance.recommendation}\n`;
    context += `- **Infrastructure**: ${augmentations.platformGuidance.infrastructure}\n\n`;
  }

  if (augmentations.experienceGuidance) {
    const eg = augmentations.experienceGuidance;
    context += `#### 🎓 Tailored to Your Experience Level\n`;
    context += `- **Coding Style**: ${eg.codingStyle}\n`;
    context += `- **Architecture Depth**: ${eg.architectureDepth}\n`;
    context += `- **Common Pitfalls to Avoid**: ${eg.pitfalls}\n\n`;
  }

  if (augmentations.featureInsights.length > 0) {
    context += `#### 🔩 Feature-Specific Engineering Directives\n`;
    augmentations.featureInsights.forEach(fi => {
      context += `\n**${fi.feature}:**\n`;
      context += `- Patterns: ${fi.patterns.join(', ')}\n`;
      context += `- Libraries: \`${fi.libraries.join('`, `')}\`\n`;
      context += `- DB: ${fi.dbHints}\n`;
      context += `- Security: ${fi.securityHints}\n`;
    });
    context += '\n';
  }

  if (augmentations.aestheticDirectives) {
    const ad = augmentations.aestheticDirectives;
    context += `#### 🎨 Visual Vibe Implementation (${ad.label}: ${ad.description})\n`;
    context += `**CSS Directives:**${ad.cssDirectives}\n`;
    context += `**Architecture Hints:**${ad.architectureHints}\n\n`;
  }

  context += `#### 🎭 AI Orchestration Principles\n${augmentations.orchestrationPrinciples}\n\n`;

  context += `#### 🔒 Mandatory Security Implementation Checklist\n${augmentations.safetyChecklist}\n`;

  return context;
};
