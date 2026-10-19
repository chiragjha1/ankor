import {
  ResearchRun,
  EvidenceSource,
  EvidenceItem,
  ProblemCard,
  EconomicModel,
  SolutionSpec,
  Objection,
  SolutionRevision,
  PersonaTemplate,
  SimulationFeedback,
  ValidationExperiment,
  ProductSpec,
  MarketingArtifact,
  WorkflowEvent,
  ApprovalGate,
  CostRecord,
  SystemSettings,
} from "@/types";

export const DEFAULT_PERSONAS: PersonaTemplate[] = [
  {
    id: "persona_smb_founder",
    name: "Marcus Vance",
    roleTitle: "Founder & CEO, MicroSaaS Studio (5 engineers)",
    organizationSize: "Small (5-10 people)",
    budgetMonthlyUSD: 150,
    technicalProficiency: "INTERMEDIATE",
    purchasingAuthority: "DECISION_MAKER",
    keyIncentive: "Eliminate onboarding hours for contractor devs without heavy enterprise tooling",
    primarySkepticism: "Will this create another config file I have to maintain manually?",
    avatarCode: "mv",
  },
  {
    id: "persona_enterprise_vp",
    name: "Elena Rostova",
    roleTitle: "VP of Engineering, Logistics Platform",
    organizationSize: "Enterprise (240 engineers)",
    budgetMonthlyUSD: 3500,
    technicalProficiency: "ADVANCED",
    purchasingAuthority: "DECISION_MAKER",
    keyIncentive: "Enforce SOC2 security controls and prevent secrets leaking into local env files",
    primarySkepticism: "Does this require kernel-level hooks or agent daemon access on employee laptops?",
    avatarCode: "er",
  },
  {
    id: "persona_junior_dev",
    name: "Leo Chen",
    roleTitle: "Fullstack Junior Engineer",
    organizationSize: "Mid-market (35 engineers)",
    budgetMonthlyUSD: 0,
    technicalProficiency: "INTERMEDIATE",
    purchasingAuthority: "END_USER_ONLY",
    keyIncentive: "I want `git pull` to just work without broken local dependencies breaking my morning",
    primarySkepticism: "If this breaks my custom terminal aliases and zsh theme, I am uninstalling it immediately",
    avatarCode: "lc",
  },
  {
    id: "persona_staff_architect",
    name: "Sarah Lindqvist",
    roleTitle: "Principal Platform Architect",
    organizationSize: "High-growth Scaleup (120 engineers)",
    budgetMonthlyUSD: 1200,
    technicalProficiency: "ADVANCED",
    purchasingAuthority: "INFLUENCER",
    keyIncentive: "Standardize microservice development without forcing heavyweight Docker desktop everywhere",
    primarySkepticism: "How does it handle macOS vs Linux architecture discrepancies and native C bindings?",
    avatarCode: "sl",
  },
  {
    id: "persona_skeptical_sysadmin",
    name: "Arthur Pendelton",
    roleTitle: "Lead IT Infrastructure Administrator",
    organizationSize: "Financial Services (400 staff)",
    budgetMonthlyUSD: 2000,
    technicalProficiency: "ADVANCED",
    purchasingAuthority: "INFLUENCER",
    keyIncentive: "Verify compliance and prevent unauthorized tunnel creation to remote servers",
    primarySkepticism: "Yet another tool claiming to solve env drift that ends up running unchecked root scripts",
    avatarCode: "ap",
  },
  {
    id: "persona_freelance_consultant",
    name: "Devon Reed",
    roleTitle: "Independent Tech Consultant",
    organizationSize: "Solo (Multiple Client Repos)",
    budgetMonthlyUSD: 40,
    technicalProficiency: "ADVANCED",
    purchasingAuthority: "DECISION_MAKER",
    keyIncentive: "Switch between 8 different client repositories without node version collisions",
    primarySkepticism: "It must be zero-friction and support local dotenv vaults out of the box",
    avatarCode: "dr",
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  openRouterApiKey: "",
  modelRegistry: {
    orchestrator: {
      primary: "openai/gpt-4o-mini",
      fallback: "openai/gpt-4o-mini",
      temperature: 0.2,
      maxTokens: 4000,
      supportsStructuredOutput: true,
    },
    scout: {
      primary: "google/gemini-2.5-flash",
      fallback: "google/gemini-2.5-flash",
      temperature: 0.3,
      maxTokens: 3000,
      supportsStructuredOutput: true,
    },
    evidence_auditor: {
      primary: "openai/gpt-4o-mini",
      fallback: "openai/gpt-4o-mini",
      temperature: 0.1,
      maxTokens: 4000,
      supportsStructuredOutput: true,
    },
    problem_framer: {
      primary: "openai/gpt-4o-mini",
      fallback: "openai/gpt-4o-mini",
      temperature: 0.3,
      maxTokens: 4000,
      supportsStructuredOutput: true,
    },
    economic_analyst: {
      primary: "openai/gpt-4o-mini",
      fallback: "openai/gpt-4o-mini",
      temperature: 0.1,
      maxTokens: 3000,
      supportsStructuredOutput: true,
    },
    solution_architect: {
      primary: "google/gemini-2.5-flash",
      fallback: "google/gemini-2.5-flash",
      temperature: 0.2,
      maxTokens: 5000,
      supportsStructuredOutput: true,
    },
    critic: {
      primary: "deepseek/deepseek-r1",
      fallback: "deepseek/deepseek-r1",
      temperature: 0.4,
      maxTokens: 4000,
      supportsStructuredOutput: true,
    },
    revision_agent: {
      primary: "qwen/qwen-2.5-coder-32b-instruct",
      fallback: "qwen/qwen-2.5-coder-32b-instruct",
      temperature: 0.2,
      maxTokens: 4000,
      supportsStructuredOutput: true,
    },
    simulation_coordinator: {
      primary: "google/gemini-2.5-flash",
      fallback: "google/gemini-2.5-flash",
      temperature: 0.7,
      maxTokens: 3500,
      supportsStructuredOutput: true,
    },
    builder: {
      primary: "qwen/qwen-2.5-coder-32b-instruct",
      fallback: "qwen/qwen-2.5-coder-32b-instruct",
      temperature: 0.1,
      maxTokens: 8000,
      supportsStructuredOutput: true,
    },
    marketer: {
      primary: "openai/gpt-4o-mini",
      fallback: "openai/gpt-4o-mini",
      temperature: 0.5,
      maxTokens: 4000,
      supportsStructuredOutput: true,
    },
  },
  budgets: {
    maxRunCostUSD: 25,
    maxStageCostUSD: 5,
  },
  critiqueLimits: {
    maxRounds: 3,
    stopOnConsecutiveNoObjections: true,
  },
  sourcesConfig: {
    enableHackerNews: true,
    enableGitHub: true,
    enableManualImport: true,
  },
  visualPreferences: {
    enableAnimations: true,
    soundEffects: false,
  },
};

export const DEMO_RUN_ID = "run_demo_ankor_01";

export const DEMO_RUN: ResearchRun = {
  id: DEMO_RUN_ID,
  name: "DevEnv Drift & Secret Synchronizer",
  searchBrief:
    "Investigate persistent developer pain points around local environment setup, configuration drift, and secret sharing across distributed engineering teams.",
  targetMarketOrDomain: "Developer Tooling / DevOps for Small Engineering Teams",
  geography: "Global (Remote & Hybrid Tech Companies)",
  constraints: {
    availableCapitalUSD: 3500,
    timeToFirstRevenueWeeks: 6,
    industriesToAvoid: ["Crypto", "Gambling"],
    preferredBusinessModels: ["B2B SaaS", "CLI Subscription"],
    budgetCeilingUSD: 25,
  },
  currentStage: "feedback_learning",
  status: "COMPLETED",
  isDemo: true,
  activeAgent: "orchestrator",
  selectedProblemId: "prob_devenv_drift_01",
  selectedSolutionId: "sol_synkro_v2",
  createdAt: "2026-10-18T10:00:00Z",
  updatedAt: "2026-10-18T16:30:00Z",
  cumulativeCostUSD: 4.82,
};

export const DEMO_SOURCES: EvidenceSource[] = [
  {
    id: "src_hn_algolia_01",
    name: "Hacker News Ask HN: What takes the most unbilled hours in your team?",
    type: "hacker_news",
    url: "https://news.ycombinator.com/item?id=38910244",
    termsCompliant: true,
    rateLimitStatus: "OK (Public API)",
    retrievedAt: "2026-10-18T10:05:00Z",
    isDemo: true,
  },
  {
    id: "src_github_issues_02",
    name: "GitHub Public Discussions: Monorepo env sync failures",
    type: "github",
    url: "https://github.com/developer-experience/feedback/discussions/419",
    termsCompliant: true,
    rateLimitStatus: "OK (Authenticated API)",
    retrievedAt: "2026-10-18T10:12:00Z",
    isDemo: true,
  },
  {
    id: "src_manual_interviews_03",
    name: "Engineering Lead Field Notes (San Francisco / London remote devs)",
    type: "document",
    url: "file:///research/interview_transcripts_oct26.txt",
    termsCompliant: true,
    retrievedAt: "2026-10-18T10:20:00Z",
    isDemo: true,
  },
];

export const DEMO_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev_01",
    runId: DEMO_RUN_ID,
    sourceId: "src_hn_algolia_01",
    sourceTitle: "Ask HN: What takes the most unbilled hours in your team?",
    sourceUrl: "https://news.ycombinator.com/item?id=38910244",
    originalExcerpt:
      "Every time we onboard a contract engineer, they spend 1.5 to 2 days just getting our local Postgres, Redis, and 14 different .env.local variables populated correctly. We tried Docker Compose, but on Apple Silicon Macs it drags battery life to zero.",
    relevantPassage:
      "Contractor onboarding lost time: 1.5 - 2 days lost per developer on local env configuration and credential sharing.",
    author: "techtiger99",
    publicationDate: "2026-09-14",
    retrievalDate: "2026-10-18T10:05:00Z",
    retrievalMethod: "Hacker News Search API via Scout",
    contentHash: "sha256_e819b1390bf0",
    epistemicStatus: "OBSERVED",
    confidence: 0.92,
    limitations: "Single commenter anecdote; mentions specific hardware friction (M-series Docker).",
    isDemo: true,
  },
  {
    id: "ev_02",
    runId: DEMO_RUN_ID,
    sourceId: "src_github_issues_02",
    sourceTitle: "Discussion: Secret leakage via Slack when debugging local setup",
    sourceUrl: "https://github.com/developer-experience/feedback/discussions/419",
    originalExcerpt:
      "We had a junior dev paste their entire staging DB password into a public Slack channel because someone asked 'what does your .env look like?'. This is the third time this quarter. Tools like Doppler and Infisical exist, but they are too complex for our 8-person team.",
    relevantPassage:
      "Security risk: Frequent secret leakage in team chats due to lack of frictionless env comparison tools.",
    author: "r_devops_guru",
    publicationDate: "2026-09-28",
    retrievalDate: "2026-10-18T10:12:00Z",
    retrievalMethod: "GitHub GraphQL API query via Scout",
    contentHash: "sha256_b4129af183c",
    epistemicStatus: "VERIFIED",
    confidence: 0.88,
    limitations: "Self-selected technical forum discussion; reflects small team pain point.",
    isDemo: true,
  },
  {
    id: "ev_03",
    runId: DEMO_RUN_ID,
    sourceId: "src_manual_interviews_03",
    sourceTitle: "Interview Notes: 6 Engineering Managers at Seed/Series A Startups",
    originalExcerpt:
      "All 6 managers confirmed that env drift causes between 3 and 7 broken builds or stalled PRs per sprint. When asked if they would pay $40/month for a CLI that keeps local env schema synced without uploading raw values to the cloud, 5 out of 6 said yes immediately.",
    relevantPassage:
      "Validation signal: 5/6 engineering managers expressed willingness to pay $40/mo for zero-knowledge local env schema sync.",
    author: "ankor User Interview Log",
    publicationDate: "2026-10-15",
    retrievalDate: "2026-10-18T10:20:00Z",
    retrievalMethod: "Direct field notes ingestion",
    contentHash: "sha256_90ff12ab44",
    epistemicStatus: "OBSERVED",
    confidence: 0.85,
    limitations: "Small qualitative sample size (N=6); stated willingness to pay requires actual conversion test.",
    isDemo: true,
  },
];

export const DEMO_PROBLEMS: ProblemCard[] = [
  {
    id: "prob_devenv_drift_01",
    runId: DEMO_RUN_ID,
    title: "Silent Local Environment Drift & Secret Leakage in Small Engineering Teams",
    customerSegment: "Engineering teams of 4 to 25 developers working on multi-service web apps",
    jobToBeDone:
      "Keep local development configurations and required environment variables in sync across team members without exposing raw credentials or breaking local setups.",
    currentWorkflow:
      "Manual maintenance of `.env.example`, DMing secrets over Slack/1Password, and ad-hoc troubleshooting during Monday standups.",
    triggerAndFrequency:
      "Occurs whenever a developer adds a new third-party API key, pulls an updated branch, or onboards a new contractor (weekly).",
    painAndConsequences:
      "Stalled sprints (avg 4.2 hours per dev/month wasted on config debugging), high risk of accidental credential leakage into git history or public chat, and frustrating onboarding friction.",
    existingWorkaround:
      "Copy-pasting `.env.example` files, DMing team leads, or deploying heavyweight enterprise secret vaults that require dedicated DevOps overhead.",
    estimatedTimeLostHoursMonthly: 24,
    estimatedMoneyLostMonthlyUSD: 1800,
    existingSpendingEvidenced:
      "Teams spend $15-30/seat on 1Password or Doppler, but developers still bypass them for local config diffs.",
    relevantAlternatives: ["Doppler", "Infisical", "Manual .env.example", "1Password CLI"],
    evidenceIds: ["ev_01", "ev_02", "ev_03"],
    counterEvidenceIds: [],
    unknowns: [
      "Will developers install a background daemon, or do they demand a pure git-hook based CLI?",
      "Can we ensure zero-knowledge architecture so no client secrets ever touch an external server?",
    ],
    confidenceScore: 0.89,
    cheapestValidationExperiment:
      "Create a landing page with a 2-minute demo video of a zero-cloud git-hook CLI that flags missing env keys before `git commit`. Measure email signups and collect 10 pre-orders at $29.",
    commercialPotentialRating: "HIGH",
    status: "SELECTED",
    isDemo: true,
  },
];

export const DEMO_ECONOMICS: EconomicModel = {
  id: "econ_model_01",
  runId: DEMO_RUN_ID,
  problemId: "prob_devenv_drift_01",
  identifiableBuyers:
    "Engineering managers, technical founders, and lead architects at companies with 4 to 30 developers.",
  buyerAccessibility:
    "High accessibility via GitHub Marketplace, Hacker News Show HN, developer subreddits, and direct Twitter/X technical outreach.",
  budgetOwnership:
    "Covered under discretionary developer tooling budgets (typically expensed on corporate credit card up to $100/mo without procurement approval).",
  assumptions: [
    {
      id: "assump_01",
      name: "Target Market Size (Global Small Dev Teams)",
      value: 145000,
      unit: "teams",
      epistemicStatus: "INFERRED",
      source: "GitHub Public Octoverse Report & Stack Overflow Developer Survey",
      confidence: 0.82,
      rationale: "Approximately 145,000 active software startups with 4-25 developers globally.",
      sensitivity: "MEDIUM",
    },
    {
      id: "assump_02",
      name: "Average Monthly Subscription Price per Team",
      value: 39,
      unit: "USD / month",
      epistemicStatus: "VERIFIED",
      source: "Competitor pricing benchmarks (Doppler Team $18/dev, Infisical Team $8/dev)",
      confidence: 0.9,
      rationale: "Flat team pricing of $39/mo is frictionless compared to per-seat billing.",
      sensitivity: "HIGH",
    },
    {
      id: "assump_03",
      name: "Customer Acquisition Cost (Organic Developer Channels)",
      value: 65,
      unit: "USD",
      epistemicStatus: "ASSUMED",
      source: "Historical developer tool acquisition data via open source + content marketing",
      confidence: 0.74,
      rationale: "Open source CLI with paid team sync features keeps initial CAC low.",
      sensitivity: "HIGH",
    },
    {
      id: "assump_04",
      name: "Monthly Customer Churn",
      value: 3.5,
      unit: "%",
      epistemicStatus: "ASSUMED",
      source: "SaaS Capital B2B developer tool benchmarks",
      confidence: 0.78,
      rationale: "Workflow tools integrated into CI/CD have sticky retention once configured.",
      sensitivity: "MEDIUM",
    },
  ],
  scenarios: {
    conservative: {
      targetCustomerCount: 65,
      averagePriceMonthlyUSD: 29,
      grossMarginPercent: 88,
      customerAcquisitionCostUSD: 110,
      monthlyChurnPercent: 5.5,
      monthlyInferenceCostUSD: 15,
      monthlyServerCostUSD: 45,
      monthlyRevenueUSD: 1885,
      monthlyGrossProfitUSD: 1658,
      monthlyNetOperatingProfitUSD: 1598,
      customerLifetimeMonths: 18.2,
      customerLifetimeValueUSD: 527.8,
      ltvToCacRatio: 4.8,
      breakEvenCustomerCount: 3,
      paybackPeriodMonths: 3.8,
    },
    base: {
      targetCustomerCount: 220,
      averagePriceMonthlyUSD: 39,
      grossMarginPercent: 91,
      customerAcquisitionCostUSD: 65,
      monthlyChurnPercent: 3.5,
      monthlyInferenceCostUSD: 35,
      monthlyServerCostUSD: 85,
      monthlyRevenueUSD: 8580,
      monthlyGrossProfitUSD: 7807,
      monthlyNetOperatingProfitUSD: 7687,
      customerLifetimeMonths: 28.6,
      customerLifetimeValueUSD: 1115.4,
      ltvToCacRatio: 17.2,
      breakEvenCustomerCount: 4,
      paybackPeriodMonths: 1.7,
    },
    optimistic: {
      targetCustomerCount: 750,
      averagePriceMonthlyUSD: 49,
      grossMarginPercent: 94,
      customerAcquisitionCostUSD: 45,
      monthlyChurnPercent: 2.2,
      monthlyInferenceCostUSD: 80,
      monthlyServerCostUSD: 190,
      monthlyRevenueUSD: 36750,
      monthlyGrossProfitUSD: 34545,
      monthlyNetOperatingProfitUSD: 34275,
      customerLifetimeMonths: 45.5,
      customerLifetimeValueUSD: 2229.5,
      ltvToCacRatio: 49.5,
      breakEvenCustomerCount: 6,
      paybackPeriodMonths: 0.9,
    },
  },
  viabilityVerdict: "VIABLE",
  rationale:
    "Low infrastructure overhead, high gross margin (88-94%), and strong LTV:CAC ratio (>4x even under conservative assumptions). The flat-rate team model avoids per-seat friction and enables immediate credit card self-serve purchases.",
  isDemo: true,
};

export const DEMO_SOLUTIONS: SolutionSpec[] = [
  {
    id: "sol_synkro_v1",
    runId: DEMO_RUN_ID,
    problemId: "prob_devenv_drift_01",
    version: 1,
    title: "ankor Sync: Zero-Knowledge Env Validator CLI",
    primaryUser: "Team Lead or Senior Developer",
    coreJobToBeDone: "Validate local environment configuration against team schema before git commit.",
    currentAlternative: "Checking `.env.example` manually or debugging stack traces on first run.",
    proposedWorkflow: [
      "Developer installs single-binary CLI: `npm i -g ankor-sync`",
      "Runs `ankor init` to generate a non-secret `.env.contract` schema file",
      "Git pre-commit hook automatically checks for missing or malformed keys",
      "Encrypted end-to-end sync shares schema updates across the team without storing raw secret values",
    ],
    minimumViableFeatures: [
      {
        id: "feat_01",
        name: "Local Schema Diff Engine",
        description: "Compares local `.env` against team contract without transmitting secrets",
        problemLink: "prob_devenv_drift_01",
        mvpRequired: true,
      },
      {
        id: "feat_02",
        name: "Zero-Knowledge Cloud Hub",
        description: "End-to-end encrypted distribution of non-secret schema constraints and types",
        problemLink: "prob_devenv_drift_01",
        mvpRequired: true,
      },
      {
        id: "feat_03",
        name: "Git Hook Installer",
        description: "One-command setup for Husky / standard git hooks",
        problemLink: "prob_devenv_drift_01",
        mvpRequired: true,
      },
    ],
    explicitlyExcludedFeatures: [
      "Custom secrets storage in our cloud database (we never want custody of customer production secrets)",
      "Heavyweight background OS daemon",
      "GUI desktop app for the initial version",
    ],
    requiredIntegrations: ["Git CLI", "GitHub OAuth (for team authorization)"],
    technicalFeasibility: "HIGH",
    reliabilityRequirements: "CLI must run in under 80ms during git pre-commit hook checks to prevent dev annoyance.",
    securityAndPrivacy: "Strict zero-knowledge architecture: only variable names, types, and regex rules are synced.",
    estimatedDevEffortDays: 14,
    operatingCostMonthlyUSD: 120,
    pricingHypothesis: "$39/month per team flat fee with unlimited repositories",
    distributionHypothesis: "Open source CLI on npm + Show HN launch + GitHub Action bot",
    measurableValueDelivered: "Reduces onboarding config time from 2 days to under 10 minutes; prevents secret leaks.",
    status: "REVISED",
    createdAt: "2026-10-18T12:00:00Z",
    isDemo: true,
  },
  {
    id: "sol_synkro_v2",
    runId: DEMO_RUN_ID,
    problemId: "prob_devenv_drift_01",
    version: 2,
    title: "ankor Sync v2: Zero-Custody Env & Secret Verifier (Hardened)",
    primaryUser: "Team Lead & Security-Conscious Developers",
    coreJobToBeDone: "Deterministic local env validation with built-in secret masking and 1Password/Doppler import.",
    currentAlternative: "Checking `.env.example` manually or using complex enterprise vaults.",
    proposedWorkflow: [
      "Developer runs `npx ankor-sync check` or activates the zero-latency pre-commit hook",
      "Inspects differences against team contract with sanitized values (e.g. `STRIPE_KEY: sk_test_*** [VALID]`)",
      "Optional one-click import from existing 1Password vault or Doppler project",
      "Team leads get instant alerts if an unvalidated variable is committed",
    ],
    minimumViableFeatures: [
      {
        id: "feat_01",
        name: "Local Schema Diff Engine",
        description: "Compares local `.env` against team contract without transmitting secrets",
        problemLink: "prob_devenv_drift_01",
        mvpRequired: true,
      },
      {
        id: "feat_02",
        name: "Zero-Knowledge Team Contract Hub",
        description: "Encrypted sync of schema types, defaults, and regex validators",
        problemLink: "prob_devenv_drift_01",
        mvpRequired: true,
      },
      {
        id: "feat_03",
        name: "Instant Git Hook Setup",
        description: "Sub-50ms git pre-commit hook written in optimized TypeScript/Rust binary",
        problemLink: "prob_devenv_drift_01",
        mvpRequired: true,
      },
      {
        id: "feat_04",
        name: "Integration Bridge for 1Password & Doppler",
        description: "Pull non-custodial schemas directly from existing team tools",
        problemLink: "prob_devenv_drift_01",
        mvpRequired: true,
      },
    ],
    explicitlyExcludedFeatures: [
      "Hosting customer database credentials in our cloud database",
      "Kernel level laptop file watchers",
      "Custom desktop electron app",
    ],
    requiredIntegrations: ["Git", "GitHub CLI", "1Password CLI (optional)"],
    technicalFeasibility: "HIGH",
    reliabilityRequirements: "Pre-commit execution strictly under 50ms; offline execution fallback if network is down.",
    securityAndPrivacy: "No secret values ever leave developer machine. Cryptographic checksums verify contracts.",
    estimatedDevEffortDays: 16,
    operatingCostMonthlyUSD: 140,
    pricingHypothesis: "$39/month flat team fee for unlimited members and repositories",
    distributionHypothesis: "Open source core CLI on npm, viral invitation when collaborating on repos",
    measurableValueDelivered: "Zero developer hours lost on env misconfiguration, 100% prevention of leaked test secrets.",
    status: "REVIEWED_WITHIN_LIMITS",
    createdAt: "2026-10-18T14:15:00Z",
    isDemo: true,
  },
];

export const DEMO_OBJECTIONS: Objection[] = [
  {
    id: "obj_01",
    solutionId: "sol_synkro_v1",
    roundNumber: 1,
    category: "SECURITY_PRIVACY",
    severity: "CRITICAL",
    description: "Enterprise and security-conscious buyers will refuse any tool that accesses `.env` without clear proof that raw values are never uploaded.",
    supportingEvidenceOrReasoning:
      "Enterprise personas (Elena Rostova, Arthur Pendelton) explicitly stated that tools touching local env files must provide cryptographic proof of zero-knowledge and open source client inspection.",
    confidence: 0.94,
    expectedImpact: "Blocks enterprise adoption and causes technical evaluators to reject on day one.",
    proposedTestOrMitigation:
      "Open source the client CLI completely, publish deterministic reproducible builds, and document that only variable names and regex schemas are sent to the relay server.",
    isBlocking: true,
    resolved: true,
    resolutionNotes: "Addressed in v2: Open source CLI architecture with client-side hashing and zero secret upload policy.",
    resolvedInVersion: 2,
  },
  {
    id: "obj_02",
    solutionId: "sol_synkro_v1",
    roundNumber: 1,
    category: "COMPETITION",
    severity: "HIGH",
    description: "Teams already paying for Doppler or 1Password will resist paying for a standalone competing tool.",
    supportingEvidenceOrReasoning:
      "Market evidence shows 60% of modern startups have a password manager. If ankor Sync requires migrating away, sales friction will be very high.",
    confidence: 0.88,
    expectedImpact: "Reduces conversion rate by 50% for teams that already have basic secret tooling.",
    proposedTestOrMitigation:
      "Position ankor Sync as a complementary validation layer that integrates with 1Password/Doppler rather than replacing them.",
    isBlocking: false,
    resolved: true,
    resolutionNotes: "Addressed in v2: Added Integration Bridge feature for 1Password CLI and Doppler exports.",
    resolvedInVersion: 2,
  },
  {
    id: "obj_03",
    solutionId: "sol_synkro_v2",
    roundNumber: 2,
    category: "OPERATIONAL_BURDEN",
    severity: "LOW",
    description: "Developers on slow internet or airplanes may get blocked by git hooks if the validation CLI requires active internet connection.",
    supportingEvidenceOrReasoning:
      "Developer experience surveys show offline capability is a hard requirement for git pre-commit hooks.",
    confidence: 0.91,
    expectedImpact: "Annoyance when working while traveling or in low-connectivity environments.",
    proposedTestOrMitigation:
      "Cache contract locally and run in offline mode when network call exceeds 100ms timeout.",
    isBlocking: false,
    resolved: true,
    resolutionNotes: "Configured offline fallback with local cache in architecture spec.",
    resolvedInVersion: 2,
  },
];

export const DEMO_REVISIONS: SolutionRevision[] = [
  {
    id: "rev_01",
    solutionId: "sol_synkro_v1",
    roundNumber: 1,
    fromVersion: 1,
    toVersion: 2,
    addressedObjectionIds: ["obj_01", "obj_02"],
    changesSummary:
      "Upgraded to v2: Enforced zero-custody open source client specification, added 1Password/Doppler integration bridges, and added offline-first execution fallback.",
    modifiedFeatures: [
      "Added Feature 04: Integration Bridge for 1Password & Doppler",
      "Refined Feature 03: Sub-50ms execution and offline caching",
    ],
    residualRisks: [
      "Reliance on npm ecosystem for distribution requires vigilant supply chain dependency audits.",
    ],
    timestamp: "2026-10-18T14:15:00Z",
  },
];

export const DEMO_FEEDBACKS: SimulationFeedback[] = [
  {
    id: "sim_fb_01",
    runId: DEMO_RUN_ID,
    personaId: "persona_smb_founder",
    personaName: "Marcus Vance",
    personaRole: "Founder & CEO, MicroSaaS Studio",
    solutionId: "sol_synkro_v2",
    initialReaction:
      "This is exactly what we need. When contractors join for a two-week sprint, I spend half my Monday debugging their local redis and stripe keys.",
    comprehensionScore: 9,
    currentAlternativeUsed: "Manual .env.example copy-pasting and Slack DMs",
    missingCapabilities: ["Support for Docker environment variable injection"],
    usabilityConcerns: ["Keep setup under 3 shell commands"],
    trustSecurityConcerns: ["As long as my Stripe secret key isn't stored in your cloud, I am happy"],
    pricingReaction: "FAIR",
    purchaseBlockers: [],
    adoptionConditions: ["Must install via standard npm or homebrew without sudo"],
    verdict: "ADOPT",
    suggestions: ["Add a quick interactive wizard: `npx ankor-sync init` that scans my current .env and makes the template"],
    epistemicStatus: "SIMULATED",
    timestamp: "2026-10-18T14:35:00Z",
    isDemo: true,
  },
  {
    id: "sim_fb_02",
    runId: DEMO_RUN_ID,
    personaId: "persona_enterprise_vp",
    personaName: "Elena Rostova",
    personaRole: "VP of Engineering, Logistics Platform",
    solutionId: "sol_synkro_v2",
    initialReaction:
      "The zero-custody architecture is the only way this passes our security council. If it truly does not store values, we would pilot this for our 240 engineers.",
    comprehensionScore: 8,
    currentAlternativeUsed: "Vault + internal scripts",
    missingCapabilities: ["Audit logs showing who added a new environment key to the repo"],
    usabilityConcerns: ["Must not slow down large mono-repo git commits"],
    trustSecurityConcerns: ["Must provide SOC2 type II compliance roadmap"],
    pricingReaction: "TOO_CHEAP",
    purchaseBlockers: ["Needs team-level RBAC for modifying shared schema rules"],
    adoptionConditions: ["SSO integration (Okta / Google Workspace)"],
    verdict: "CONSIDER",
    suggestions: ["Charge enterprise tier $299/mo with audit logs and SSO"],
    epistemicStatus: "SIMULATED",
    timestamp: "2026-10-18T14:38:00Z",
    isDemo: true,
  },
  {
    id: "sim_fb_03",
    runId: DEMO_RUN_ID,
    personaId: "persona_junior_dev",
    personaName: "Leo Chen",
    personaRole: "Fullstack Junior Engineer",
    solutionId: "sol_synkro_v2",
    initialReaction:
      "I love anything that saves me from having to ask my tech lead 'hey why is the auth service crashing with undefined token?'",
    comprehensionScore: 10,
    currentAlternativeUsed: "Asking tech lead in Slack",
    missingCapabilities: ["Visual terminal diff with colored green/red checkmarks"],
    usabilityConcerns: ["Must have helpful error messages explaining where to get the missing key"],
    trustSecurityConcerns: ["None, as long as it works"],
    pricingReaction: "FAIR",
    purchaseBlockers: [],
    adoptionConditions: ["Company pays for the team account"],
    verdict: "ADOPT",
    suggestions: ["Include a helpful documentation link next to missing variables"],
    epistemicStatus: "SIMULATED",
    timestamp: "2026-10-18T14:40:00Z",
    isDemo: true,
  },
  {
    id: "sim_fb_04",
    runId: DEMO_RUN_ID,
    personaId: "persona_staff_architect",
    personaName: "Sarah Lindqvist",
    personaRole: "Principal Platform Architect",
    solutionId: "sol_synkro_v2",
    initialReaction:
      "A contract-based schema for env variables is a sound engineering pattern. Much better than trying to turn everything into a remote container.",
    comprehensionScore: 9,
    currentAlternativeUsed: "Custom bash validation scripts in package.json",
    missingCapabilities: ["Support for monorepo workspaces (pnpm / Turborepo)"],
    usabilityConcerns: ["Must handle multiple nested packages with different env requirements"],
    trustSecurityConcerns: ["Ensure no telemetry sends variable name substrings that could be sensitive"],
    pricingReaction: "FAIR",
    purchaseBlockers: ["Monorepo support must be rock solid"],
    adoptionConditions: ["Supports Turborepo and pnpm monorepos"],
    verdict: "ADOPT",
    suggestions: ["Provide a `.env.schema.json` format that VSCode extension can autocomplete"],
    epistemicStatus: "SIMULATED",
    timestamp: "2026-10-18T14:42:00Z",
    isDemo: true,
  },
  {
    id: "sim_fb_05",
    runId: DEMO_RUN_ID,
    personaId: "persona_skeptical_sysadmin",
    personaName: "Arthur Pendelton",
    personaRole: "Lead IT Infrastructure Administrator",
    solutionId: "sol_synkro_v2",
    initialReaction:
      "Skeptical at first, but v2's zero-custody guarantee and client-side regex check is surprisingly responsible.",
    comprehensionScore: 8,
    currentAlternativeUsed: "Ansible vault and strict workstation images",
    missingCapabilities: ["Central disable switch if a machine is compromised"],
    usabilityConcerns: ["Must not interfere with SSH deployment keys"],
    trustSecurityConcerns: ["Verified: zero cloud secret custody makes this acceptable"],
    pricingReaction: "FAIR",
    purchaseBlockers: [],
    adoptionConditions: ["Explicit opt-out of all remote telemetry"],
    verdict: "CONSIDER",
    suggestions: ["Add a flag `--no-telemetry` for high-security environments"],
    epistemicStatus: "SIMULATED",
    timestamp: "2026-10-18T14:45:00Z",
    isDemo: true,
  },
  {
    id: "sim_fb_06",
    runId: DEMO_RUN_ID,
    personaId: "persona_freelance_consultant",
    personaName: "Devon Reed",
    personaRole: "Independent Tech Consultant",
    solutionId: "sol_synkro_v2",
    initialReaction:
      "I juggle 6 client projects and I constantly have the wrong database port configured. This would save me at least 3 hours a week.",
    comprehensionScore: 10,
    currentAlternativeUsed: "Notepad files with notes for each client",
    missingCapabilities: ["Quick profile switching per client"],
    usabilityConcerns: ["Make sure it doesn't collide with direnv"],
    trustSecurityConcerns: ["Client NDA compliance requires zero cloud leakage"],
    pricingReaction: "FAIR",
    purchaseBlockers: [],
    adoptionConditions: ["Free tier for solo developers, paid for shared team sync"],
    verdict: "ADOPT",
    suggestions: ["Offer a free community tier for open source and solo devs"],
    epistemicStatus: "SIMULATED",
    timestamp: "2026-10-18T14:48:00Z",
    isDemo: true,
  },
];

export const DEMO_EXPERIMENT: ValidationExperiment = {
  id: "exp_validation_01",
  runId: DEMO_RUN_ID,
  problemId: "prob_devenv_drift_01",
  hypothesis:
    "At least 40% of small tech startup leads will commit to testing a zero-knowledge CLI if shown a 60-second video of env drift detection during git commit.",
  targetParticipant: "Founders, CTOs, and Engineering Leads of remote software teams (4-20 devs)",
  recruitmentMethod:
    "Organic Twitter/X technical thread, post on Hacker News Show HN with open source core, and direct outreach to 25 remote startup founders.",
  costUSD: 180,
  durationDays: 7,
  successThreshold: ">= 10 qualified interviews and >= 5 teams agreeing to install pre-release CLI",
  failureThreshold: "< 3 qualified teams interested after 25 outreach conversations",
  confoundingFactors: [
    "Developers might say yes in interviews but delay installing due to workload",
    "Company security policies may require formal approval before installing npm binaries",
  ],
  decisionOnPass: "Proceed to Stage 10 (Product Construction) and generate the production CLI MVP.",
  decisionOnFail: "Pivot problem framing or reject hypothesis; avoid spending engineering capital.",
  status: "COMPLETED",
  results: {
    interviewsConducted: 14,
    positiveResponses: 11,
    pilotCommitmentsCount: 8,
    paidPilotsCount: 4,
    notes:
      "Conducted 14 interviews with engineering leads. 8 agreed to join the private beta immediately, and 4 teams pre-purchased annual team licenses ($390/yr) upfront to get prioritized monorepo support.",
    verdict: "PASSED",
    decisionTaken: "CONTINUE",
  },
  isDemo: true,
};

export const DEMO_PRODUCT_SPEC: ProductSpec = {
  id: "prod_ankorsync_01",
  runId: DEMO_RUN_ID,
  solutionId: "sol_synkro_v2",
  name: "ankor Sync CLI & Team Schema Hub",
  frozenAt: "2026-10-18T15:00:00Z",
  architectureOverview:
    "Lightweight TypeScript CLI executed via Node or standalone compiled binary. Reads local `.env` and `.env.contract`, validates schema types and required keys, and enforces zero-custody cryptographic checks during pre-commit hooks.",
  backendStack: "Next.js 15 API routes, TypeScript, SQLite/PostgreSQL schema metadata repository",
  frontendStack: "Next.js React dashboard for team management, Tailwind CSS, Lucide icons",
  databaseSchemaDescription:
    "Teams, Projects, ContractVersions, EncryptedSchemaRules, InvitationTokens, AuditLogs",
  files: [
    {
      path: "packages/cli/src/checker.ts",
      description: "Core environment variable validator and regex matcher",
      language: "typescript",
      content: `// ankor Sync - Local Schema Validation Engine
// Cryptographic zero-custody: raw values never leave this machine.
export interface ValidationResult {
  valid: boolean;
  missingKeys: string[];
  typeErrors: { key: string; expected: string; received: string }[];
}

export function validateEnv(localEnv: Record<string, string>, schemaRules: Record<string, string>): ValidationResult {
  const missingKeys: string[] = [];
  const typeErrors: { key: string; expected: string; received: string }[] = [];

  for (const [key, expectedRule] of Object.entries(schemaRules)) {
    const val = localEnv[key];
    if (val === undefined || val.trim() === '') {
      missingKeys.push(key);
      continue;
    }
    if (expectedRule === 'url' && !val.startsWith('http://') && !val.startsWith('https://')) {
      typeErrors.push({ key, expected: 'url (http/https)', received: 'malformed_string' });
    }
    if (expectedRule === 'number' && isNaN(Number(val))) {
      typeErrors.push({ key, expected: 'numeric', received: typeof val });
    }
  }

  return {
    valid: missingKeys.length === 0 && typeErrors.length === 0,
    missingKeys,
    typeErrors,
  };
}`,
    },
    {
      path: "packages/cli/src/git-hook.ts",
      description: "Sub-50ms git pre-commit hook validator",
      language: "typescript",
      content: `// Git pre-commit hook integration
import { validateEnv } from './checker';

export async function runPreCommitCheck(): Promise<number> {
  const start = performance.now();
  console.log('[ankor-sync] Validating local environment against team contract...');
  
  // Simulated deterministic check
  const duration = Math.round(performance.now() - start);
  console.log(\`[ankor-sync] Verified 18 environment keys in \${duration}ms. Zero secrets leaked.\`);
  return 0;
}`,
    },
    {
      path: "packages/cli/test/checker.test.ts",
      description: "Automated test suite verifying zero-custody and regex rules",
      language: "typescript",
      content: `import { describe, it, expect } from 'vitest';
import { validateEnv } from '../src/checker';

describe('validateEnv', () => {
  it('detects missing required keys', () => {
    const local = { DATABASE_URL: 'postgres://localhost:5432' };
    const schema = { DATABASE_URL: 'url', STRIPE_SECRET: 'string' };
    const res = validateEnv(local, schema);
    expect(res.valid).toBe(false);
    expect(res.missingKeys).toContain('STRIPE_SECRET');
  });

  it('passes when all contracts are satisfied', () => {
    const local = { DATABASE_URL: 'https://db.internal', STRIPE_SECRET: 'sk_test_123' };
    const schema = { DATABASE_URL: 'url', STRIPE_SECRET: 'string' };
    const res = validateEnv(local, schema);
    expect(res.valid).toBe(true);
  });
});`,
    },
  ],
  qualityGates: {
    buildSucceeds: true,
    testsPass: true,
    authCheckedServerSide: true,
    secretsExcluded: true,
    dataValidationImplemented: true,
    criticalVulnerabilitiesBlocked: true,
  },
  buildStatus: "AWAITING_DEPLOYMENT_APPROVAL",
  buildLogs: [
    "Executing typecheck across all 3 packages... Clean: 0 errors.",
    "Running automated test suite (packages/cli/test/checker.test.ts)...",
    "PASS packages/cli/test/checker.test.ts (2 tests passed, 0 failed, 32ms)",
    "Security scan: 0 critical vulnerabilities found. 0 secrets present in source.",
    "Build artifact generated: ankor-sync-cli-v1.0.0.tgz",
    "Quality gates verified. Awaiting deployment authorization.",
  ],
  testSummary: {
    total: 2,
    passed: 2,
    failed: 0,
  },
  deploymentAuthorized: false,
  isDemo: true,
};

export const DEMO_MARKETING: MarketingArtifact[] = [
  {
    id: "mkt_pos_01",
    runId: DEMO_RUN_ID,
    type: "POSITIONING",
    title: "Brand Positioning & Value Proposition",
    targetAudience: "Engineering leads and CTOs of 4-25 developer remote teams",
    intendedChannel: "Company Documentation, Pitch Decks, and Landing Page Header",
    content:
      "For small, agile engineering teams who are tired of broken morning standups and leaked secrets, ankor Sync is a zero-knowledge CLI that guarantees everyone's local environment matches team contracts in under 50ms. Unlike heavyweight enterprise vaults, ankor Sync requires zero cloud secret custody and installs in one command.",
    groundedClaimIds: ["ev_01", "ev_02", "ev_03"],
    status: "APPROVED",
    createdAt: "2026-10-18T15:20:00Z",
    isDemo: true,
  },
  {
    id: "mkt_copy_02",
    runId: DEMO_RUN_ID,
    type: "LANDING_PAGE_COPY",
    title: "High-Converting Landing Page Hero & Feature Sections",
    targetAudience: "Lead developers and technical founders",
    intendedChannel: "Website Homepage (ankor-sync.dev)",
    content: `# Stop Wasting Monday Morning On Broken .env Files

Keep your team's local development environment strictly in sync. Zero secret custody. Sub-50ms git pre-commit checks.

\`\`\`bash
npm i -g @ankor/sync
ankor init
\`\`\`

### Why Small Engineering Teams Love ankor Sync:
1. **Zero Secret Custody:** Your database passwords and private keys stay on your machine. We only synchronize schema rules, types, and variable names.
2. **Instant Pre-commit Protection:** Catches missing Stripe or AWS keys before your code hits GitHub.
3. **Works With Your Existing Stack:** Integrates seamlessly with 1Password, Doppler, or plain .env files.
4. **Onboard Contractors in 60 Seconds:** No more 2-day onboarding slogs. New hires run \`ankor doctor\` and see every required config immediately.`,
    groundedClaimIds: ["ev_01", "ev_02"],
    status: "APPROVED",
    createdAt: "2026-10-18T15:35:00Z",
    isDemo: true,
  },
  {
    id: "mkt_launch_03",
    runId: DEMO_RUN_ID,
    type: "LAUNCH_POST",
    title: "Hacker News Show HN Submission Draft",
    targetAudience: "Developers and startup founders on Hacker News",
    intendedChannel: "Hacker News (Show HN)",
    content: `Show HN: ankor Sync - Zero-knowledge local env validator for small teams

Hey HN! We built ankor Sync because our 6-person team was constantly dealing with broken builds whenever someone added a new environment variable. We looked at Doppler and Infisical, but our security folks didn't want our client secrets stored in another third-party SaaS, and our junior devs kept pasting secrets into Slack.

ankor Sync is open source and takes a contract approach: it validates that your local .env has all the keys and types specified by your team's .env.contract file, but strictly never uploads values anywhere.

CLI runs in <50ms as a git hook. We'd love your feedback on the schema format!`,
    groundedClaimIds: ["ev_01", "ev_02"],
    status: "DRAFT",
    createdAt: "2026-10-18T15:50:00Z",
    isDemo: true,
  },
];

export const DEMO_EVENTS: WorkflowEvent[] = [
  {
    id: "evt_01",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T10:00:00Z",
    type: "RUN_STARTED",
    agentRole: "orchestrator",
    stage: "search_definition",
    summary: "Research run initialized: Developer Environment Drift & Config Sync Tool",
    severity: "info",
  },
  {
    id: "evt_02",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T10:05:00Z",
    type: "SOURCE_RETRIEVED",
    agentRole: "scout",
    stage: "evidence_collection",
    summary: "Scout retrieved 3 discussions from Hacker News and GitHub developer forums",
    severity: "info",
  },
  {
    id: "evt_03",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T10:25:00Z",
    type: "EVIDENCE_AUDITED",
    agentRole: "evidence_auditor",
    stage: "evidence_assessment",
    summary: "Evidence Auditor validated 3 claims; marked 2 as OBSERVED and 1 as VERIFIED",
    severity: "success",
  },
  {
    id: "evt_04",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T10:45:00Z",
    type: "PROBLEM_FRAMED",
    agentRole: "problem_framer",
    stage: "problem_discovery",
    summary: "Problem Framer identified high-pain cluster: Silent Local Env Drift in Small Teams",
    severity: "success",
  },
  {
    id: "evt_05",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T11:30:00Z",
    type: "ECONOMICS_CALCULATED",
    agentRole: "economic_analyst",
    stage: "economic_investigation",
    summary: "Economic Analyst calculated viable economics: Base LTV/CAC ratio 17.2x, break-even at 4 teams",
    severity: "success",
  },
  {
    id: "evt_06",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T12:00:00Z",
    type: "SOLUTION_DESIGNED",
    agentRole: "solution_architect",
    stage: "solution_design",
    summary: "Solution Architect proposed ankor Sync v1 with zero-knowledge CLI validator",
    severity: "info",
  },
  {
    id: "evt_07",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T13:10:00Z",
    type: "OBJECTION_RAISED",
    agentRole: "critic",
    stage: "adversarial_review",
    summary: "Critic raised CRITICAL objection on customer secret trust and HIGH objection on competitor friction",
    severity: "warning",
  },
  {
    id: "evt_08",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T14:15:00Z",
    type: "SOLUTION_REVISED",
    agentRole: "revision_agent",
    stage: "adversarial_review",
    summary: "Revision Agent delivered v2 addressing all critical objections with open source client architecture",
    severity: "success",
  },
  {
    id: "evt_09",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T14:50:00Z",
    type: "SIMULATION_COMPLETED",
    agentRole: "simulation_coordinator",
    stage: "customer_simulation",
    summary: "Simulation Coordinator completed 6 persona reviews; 4 Adopt, 2 Consider, 0 Reject",
    severity: "success",
  },
  {
    id: "evt_10",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T15:00:00Z",
    type: "VALIDATION_PASSED",
    agentRole: "orchestrator",
    stage: "validation_experiment",
    summary: "Field validation completed: 14 founder interviews, 4 paid annual pre-orders, VERDICT: CONTINUE",
    severity: "success",
  },
  {
    id: "evt_11",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T15:30:00Z",
    type: "BUILD_PREPARED",
    agentRole: "builder",
    stage: "product_construction",
    summary: "Builder generated frozen specification, test suite, and verified zero-custody assertions",
    severity: "info",
  },
  {
    id: "evt_12",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T16:00:00Z",
    type: "APPROVAL_REQUESTED",
    agentRole: "orchestrator",
    stage: "product_construction",
    summary: "Deployment Gate: Awaiting explicit founder authorization before production publish",
    severity: "warning",
  },
];

export const DEMO_APPROVALS: ApprovalGate[] = [
  {
    id: "appr_deploy_01",
    runId: DEMO_RUN_ID,
    type: "DEPLOYMENT",
    title: "Production NPM Package & Staging Relay Deployment",
    description: "Authorize the automated publication of @ankor/sync v1.0.0 to public registries.",
    requestedAt: "2026-10-18T16:00:00Z",
    status: "PENDING",
  },
];

export const DEMO_COSTS: CostRecord[] = [
  {
    id: "cost_01",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T10:05:00Z",
    agentRole: "scout",
    modelId: "openai/gpt-4o-mini",
    tokensPrompt: 2100,
    tokensCompletion: 450,
    estimatedCostUSD: 0.0007,
    purpose: "Source extraction and deduplication check",
  },
  {
    id: "cost_02",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T10:25:00Z",
    agentRole: "evidence_auditor",
    modelId: "anthropic/claude-3.5-sonnet",
    tokensPrompt: 4500,
    tokensCompletion: 820,
    estimatedCostUSD: 0.026,
    purpose: "Epistemic auditing and claim-evidence verification",
  },
  {
    id: "cost_03",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T10:45:00Z",
    agentRole: "problem_framer",
    modelId: "anthropic/claude-3.5-sonnet",
    tokensPrompt: 5100,
    tokensCompletion: 1200,
    estimatedCostUSD: 0.033,
    purpose: "Problem card synthesis and validation design",
  },
  {
    id: "cost_04",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T11:30:00Z",
    agentRole: "economic_analyst",
    modelId: "openai/gpt-4o-mini",
    tokensPrompt: 3200,
    tokensCompletion: 900,
    estimatedCostUSD: 0.0011,
    purpose: "Assumption extraction for deterministic economic engine",
  },
  {
    id: "cost_05",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T12:00:00Z",
    agentRole: "solution_architect",
    modelId: "anthropic/claude-3.5-sonnet",
    tokensPrompt: 6200,
    tokensCompletion: 1950,
    estimatedCostUSD: 0.048,
    purpose: "Solution v1 specification generation",
  },
  {
    id: "cost_06",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T13:10:00Z",
    agentRole: "critic",
    modelId: "deepseek/deepseek-r1",
    tokensPrompt: 5800,
    tokensCompletion: 1400,
    estimatedCostUSD: 0.015,
    purpose: "Adversarial critique round 1",
  },
  {
    id: "cost_07",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T14:15:00Z",
    agentRole: "revision_agent",
    modelId: "anthropic/claude-3.5-sonnet",
    tokensPrompt: 7100,
    tokensCompletion: 1800,
    estimatedCostUSD: 0.049,
    purpose: "Solution v2 architecture revision",
  },
  {
    id: "cost_08",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T14:50:00Z",
    agentRole: "simulation_coordinator",
    modelId: "openai/gpt-4o-mini",
    tokensPrompt: 8500,
    tokensCompletion: 2400,
    estimatedCostUSD: 0.003,
    purpose: "6 persona simulations and synthesis",
  },
  {
    id: "cost_09",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T15:30:00Z",
    agentRole: "builder",
    modelId: "qwen/qwen-2.5-coder-32b-instruct",
    tokensPrompt: 11200,
    tokensCompletion: 3800,
    estimatedCostUSD: 0.028,
    purpose: "Test runner and production file generation",
  },
  {
    id: "cost_10",
    runId: DEMO_RUN_ID,
    timestamp: "2026-10-18T16:00:00Z",
    agentRole: "marketer",
    modelId: "openai/gpt-4o",
    tokensPrompt: 6400,
    tokensCompletion: 1600,
    estimatedCostUSD: 0.038,
    purpose: "Marketing copy and Hacker News launch draft",
  },
];
