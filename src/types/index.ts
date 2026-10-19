import { z } from "zod";

// ==========================================
// EPISTEMIC STATUS & CORE LITERALS
// ==========================================
export const EpistemicStatusSchema = z.enum([
  "OBSERVED",
  "VERIFIED",
  "INFERRED",
  "ASSUMED",
  "SIMULATED",
  "UNKNOWN",
]);
export type EpistemicStatus = z.infer<typeof EpistemicStatusSchema>;

export const AgentRoleIdSchema = z.enum([
  "orchestrator",
  "scout",
  "evidence_auditor",
  "problem_framer",
  "economic_analyst",
  "solution_architect",
  "critic",
  "revision_agent",
  "simulation_coordinator",
  "builder",
  "marketer",
]);
export type AgentRoleId = z.infer<typeof AgentRoleIdSchema>;

export const AgentStatusSchema = z.enum([
  "idle",
  "working",
  "thinking",
  "communicating",
  "successful",
  "blocked",
  "error",
]);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export const WorkflowStageSchema = z.enum([
  "search_definition",
  "evidence_collection",
  "evidence_assessment",
  "problem_discovery",
  "economic_investigation",
  "solution_design",
  "adversarial_review",
  "customer_simulation",
  "validation_experiment",
  "product_construction",
  "marketing_distribution",
  "feedback_learning",
]);
export type WorkflowStage = z.infer<typeof WorkflowStageSchema>;

export const RunStatusSchema = z.enum([
  "CREATED",
  "CONFIGURING",
  "COLLECTING_EVIDENCE",
  "ASSESSING_EVIDENCE",
  "FRAMING_PROBLEMS",
  "INVESTIGATING_ECONOMICS",
  "DESIGNING_SOLUTION",
  "CRITIQUING",
  "REVISING",
  "SIMULATING_CUSTOMERS",
  "PLANNING_VALIDATION",
  "AWAITING_APPROVAL",
  "BUILDING",
  "TESTING",
  "AWAITING_DEPLOYMENT_APPROVAL",
  "DEPLOYING",
  "MARKETING_PREPARATION",
  "RUNNING",
  "PAUSED",
  "BLOCKED",
  "FAILED",
  "COMPLETED",
  "CANCELLED",
  "KILLED",
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

// ==========================================
// EVIDENCE & CLAIMS
// ==========================================
export const EvidenceSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "hacker_news",
    "github",
    "manual_url",
    "document",
    "reddit",
    "synthetic",
  ]),
  url: z.string().optional(),
  termsCompliant: z.boolean(),
  rateLimitStatus: z.string().optional(),
  retrievedAt: z.string(),
  isDemo: z.boolean().default(false),
});
export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;

export const EvidenceItemSchema = z.object({
  id: z.string(),
  runId: z.string(),
  sourceId: z.string(),
  sourceTitle: z.string(),
  sourceUrl: z.string().optional(),
  originalExcerpt: z.string(),
  relevantPassage: z.string(),
  author: z.string().optional(),
  publicationDate: z.string().optional(),
  retrievalDate: z.string(),
  retrievalMethod: z.string(),
  contentHash: z.string(),
  duplicateOfId: z.string().optional(),
  candidateProblemId: z.string().optional(),
  epistemicStatus: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  limitations: z.string(),
  isDemo: z.boolean().default(false),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const ClaimSchema = z.object({
  id: z.string(),
  runId: z.string(),
  text: z.string(),
  epistemicStatus: EpistemicStatusSchema,
  supportingEvidenceIds: z.array(z.string()),
  contradictingEvidenceIds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  unresolvedUncertainty: z.string().optional(),
});
export type Claim = z.infer<typeof ClaimSchema>;

// ==========================================
// PROBLEM CARD
// ==========================================
export const ProblemCardSchema = z.object({
  id: z.string(),
  runId: z.string(),
  title: z.string(),
  customerSegment: z.string(),
  jobToBeDone: z.string(),
  currentWorkflow: z.string(),
  triggerAndFrequency: z.string(),
  painAndConsequences: z.string(),
  existingWorkaround: z.string(),
  estimatedTimeLostHoursMonthly: z.number(),
  estimatedMoneyLostMonthlyUSD: z.number(),
  existingSpendingEvidenced: z.string(),
  relevantAlternatives: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  counterEvidenceIds: z.array(z.string()).default([]),
  unknowns: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  cheapestValidationExperiment: z.string(),
  commercialPotentialRating: z.enum([
    "HIGH",
    "MEDIUM",
    "LOW",
    "INSUFFICIENT_EVIDENCE",
  ]),
  status: z.enum(["CANDIDATE", "SELECTED", "REJECTED"]).default("CANDIDATE"),
  rejectionReason: z.string().optional(),
  isDemo: z.boolean().default(false),
});
export type ProblemCard = z.infer<typeof ProblemCardSchema>;

// ==========================================
// ECONOMIC MODEL & DETERMINISTIC SCENARIOS
// ==========================================
export const EconomicAssumptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  epistemicStatus: EpistemicStatusSchema,
  source: z.string(),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  sensitivity: z.enum(["HIGH", "MEDIUM", "LOW"]),
});
export type EconomicAssumption = z.infer<typeof EconomicAssumptionSchema>;

export const EconomicScenarioSchema = z.object({
  targetCustomerCount: z.number(),
  averagePriceMonthlyUSD: z.number(),
  grossMarginPercent: z.number(),
  customerAcquisitionCostUSD: z.number(),
  monthlyChurnPercent: z.number(),
  monthlyInferenceCostUSD: z.number(),
  monthlyServerCostUSD: z.number(),
  // Deterministic computed fields
  monthlyRevenueUSD: z.number(),
  monthlyGrossProfitUSD: z.number(),
  monthlyNetOperatingProfitUSD: z.number(),
  customerLifetimeMonths: z.number(),
  customerLifetimeValueUSD: z.number(),
  ltvToCacRatio: z.number(),
  breakEvenCustomerCount: z.number(),
  paybackPeriodMonths: z.number(),
});
export type EconomicScenario = z.infer<typeof EconomicScenarioSchema>;

export const EconomicModelSchema = z.object({
  id: z.string(),
  runId: z.string(),
  problemId: z.string(),
  identifiableBuyers: z.string(),
  buyerAccessibility: z.string(),
  budgetOwnership: z.string(),
  assumptions: z.array(EconomicAssumptionSchema),
  scenarios: z.object({
    conservative: EconomicScenarioSchema,
    base: EconomicScenarioSchema,
    optimistic: EconomicScenarioSchema,
  }),
  viabilityVerdict: z.enum([
    "VIABLE",
    "MARGINAL",
    "UNVIABLE",
    "INSUFFICIENT_EVIDENCE",
  ]),
  rationale: z.string(),
  isDemo: z.boolean().default(false),
});
export type EconomicModel = z.infer<typeof EconomicModelSchema>;

// ==========================================
// SOLUTION SPEC & ADVERSARIAL CRITIQUE
// ==========================================
export const FeatureSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  problemLink: z.string(),
  mvpRequired: z.boolean().default(true),
});
export type FeatureSpec = z.infer<typeof FeatureSpecSchema>;

export const SolutionSpecSchema = z.object({
  id: z.string(),
  runId: z.string(),
  problemId: z.string(),
  version: z.number(),
  title: z.string(),
  primaryUser: z.string(),
  coreJobToBeDone: z.string(),
  currentAlternative: z.string(),
  proposedWorkflow: z.array(z.string()),
  minimumViableFeatures: z.array(FeatureSpecSchema),
  explicitlyExcludedFeatures: z.array(z.string()),
  requiredIntegrations: z.array(z.string()),
  technicalFeasibility: z.enum(["HIGH", "MEDIUM", "LOW"]),
  reliabilityRequirements: z.string(),
  securityAndPrivacy: z.string(),
  estimatedDevEffortDays: z.number(),
  operatingCostMonthlyUSD: z.number(),
  pricingHypothesis: stringOrNumber(),
  distributionHypothesis: z.string(),
  measurableValueDelivered: z.string(),
  status: z.enum([
    "DRAFT",
    "UNDER_CRITIQUE",
    "REVISED",
    "REVIEWED_WITHIN_LIMITS",
    "APPROVED",
    "BLOCKED",
  ]),
  createdAt: z.string(),
  isDemo: z.boolean().default(false),
});
export type SolutionSpec = z.infer<typeof SolutionSpecSchema>;

function stringOrNumber() {
  return z.union([z.string(), z.number()]).transform((v) => String(v));
}

export const ObjectionSeveritySchema = z.enum([
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
]);
export type ObjectionSeverity = z.infer<typeof ObjectionSeveritySchema>;

export const ObjectionSchema = z.object({
  id: z.string(),
  solutionId: z.string(),
  roundNumber: z.number(),
  category: z.enum([
    "PROBLEM_VALIDITY",
    "WILLINGNESS_TO_PAY",
    "TECHNICAL_FEASIBILITY",
    "DATA_AVAILABILITY",
    "RELIABILITY",
    "SECURITY_PRIVACY",
    "COMPETITION",
    "DISTRIBUTION",
    "UNIT_ECONOMICS",
    "OPERATIONAL_BURDEN",
    "LEGAL_REGULATORY",
    "FAILURE_MODES",
  ]),
  severity: ObjectionSeveritySchema,
  description: z.string(),
  supportingEvidenceOrReasoning: z.string(),
  confidence: z.number().min(0).max(1),
  expectedImpact: z.string(),
  proposedTestOrMitigation: z.string(),
  isBlocking: z.boolean(),
  resolved: z.boolean().default(false),
  resolutionNotes: z.string().optional(),
  resolvedInVersion: z.number().optional(),
});
export type Objection = z.infer<typeof ObjectionSchema>;

export const SolutionRevisionSchema = z.object({
  id: z.string(),
  solutionId: z.string(),
  roundNumber: z.number(),
  fromVersion: z.number(),
  toVersion: z.number(),
  addressedObjectionIds: z.array(z.string()),
  changesSummary: z.string(),
  modifiedFeatures: z.array(z.string()),
  residualRisks: z.array(z.string()),
  timestamp: z.string(),
});
export type SolutionRevision = z.infer<typeof SolutionRevisionSchema>;

// ==========================================
// SIMULATED PERSONAS
// ==========================================
export const PersonaTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  roleTitle: z.string(),
  organizationSize: z.string(),
  budgetMonthlyUSD: z.number(),
  technicalProficiency: z.enum(["NON_TECHNICAL", "INTERMEDIATE", "ADVANCED"]),
  purchasingAuthority: z.enum([
    "DECISION_MAKER",
    "INFLUENCER",
    "END_USER_ONLY",
  ]),
  keyIncentive: z.string(),
  primarySkepticism: z.string(),
  avatarCode: z.string(),
});
export type PersonaTemplate = z.infer<typeof PersonaTemplateSchema>;

export const SimulationFeedbackSchema = z.object({
  id: z.string(),
  runId: z.string(),
  personaId: z.string(),
  personaName: z.string(),
  personaRole: z.string(),
  solutionId: z.string(),
  initialReaction: z.string(),
  comprehensionScore: z.number().min(1).max(10),
  currentAlternativeUsed: z.string(),
  missingCapabilities: z.array(z.string()),
  usabilityConcerns: z.array(z.string()),
  trustSecurityConcerns: z.array(z.string()),
  pricingReaction: z.enum(["TOO_CHEAP", "FAIR", "EXPENSIVE", "DEALBREAKER"]),
  purchaseBlockers: z.array(z.string()),
  adoptionConditions: z.array(z.string()),
  verdict: z.enum(["ADOPT", "CONSIDER", "REJECT"]),
  suggestions: z.array(z.string()),
  epistemicStatus: z.literal("SIMULATED").default("SIMULATED"),
  timestamp: z.string(),
  isDemo: z.boolean().default(false),
});
export type SimulationFeedback = z.infer<typeof SimulationFeedbackSchema>;

// ==========================================
// VALIDATION EXPERIMENTS
// ==========================================
export const ValidationExperimentSchema = z.object({
  id: z.string(),
  runId: z.string(),
  problemId: z.string(),
  hypothesis: z.string(),
  targetParticipant: z.string(),
  recruitmentMethod: z.string(),
  costUSD: z.number(),
  durationDays: z.number(),
  successThreshold: z.string(),
  failureThreshold: z.string(),
  confoundingFactors: z.array(z.string()),
  decisionOnPass: z.string(),
  decisionOnFail: z.string(),
  status: z
    .enum(["PROPOSED", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .default("PROPOSED"),
  results: z
    .object({
      interviewsConducted: z.number().default(0),
      positiveResponses: z.number().default(0),
      pilotCommitmentsCount: z.number().default(0),
      paidPilotsCount: z.number().default(0),
      notes: z.string(),
      verdict: z.enum(["PASSED", "FAILED", "INCONCLUSIVE"]),
      decisionTaken: z.enum([
        "CONTINUE",
        "ITERATE",
        "CHANGE_POSITIONING",
        "CHANGE_PRICING",
        "PIVOT",
        "PAUSE",
        "KILL",
      ]),
    })
    .optional(),
  isDemo: z.boolean().default(false),
});
export type ValidationExperiment = z.infer<typeof ValidationExperimentSchema>;

// ==========================================
// PRODUCT SPEC & BUILD RESULTS
// ==========================================
export const GeneratedFileSchema = z.object({
  path: z.string(),
  description: z.string(),
  content: z.string(),
  language: z.string().default("typescript"),
});
export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;

export const ProductSpecSchema = z.object({
  id: z.string(),
  runId: z.string(),
  solutionId: z.string(),
  name: z.string(),
  frozenAt: z.string(),
  architectureOverview: z.string(),
  backendStack: z.string(),
  frontendStack: z.string(),
  databaseSchemaDescription: z.string(),
  files: z.array(GeneratedFileSchema),
  qualityGates: z.object({
    buildSucceeds: z.boolean(),
    testsPass: z.boolean(),
    authCheckedServerSide: z.boolean(),
    secretsExcluded: z.boolean(),
    dataValidationImplemented: z.boolean(),
    criticalVulnerabilitiesBlocked: z.boolean(),
  }),
  buildStatus: z
    .enum([
      "UNBUILT",
      "BUILDING",
      "PASSED",
      "FAILED",
      "AWAITING_DEPLOYMENT_APPROVAL",
      "DEPLOYED",
    ])
    .default("UNBUILT"),
  buildLogs: z.array(z.string()).default([]),
  testSummary: z
    .object({
      total: z.number(),
      passed: z.number(),
      failed: z.number(),
    })
    .optional(),
  deploymentAuthorized: z.boolean().default(false),
  deploymentUrl: z.string().optional(),
  isDemo: z.boolean().default(false),
});
export type ProductSpec = z.infer<typeof ProductSpecSchema>;

// ==========================================
// MARKETING ARTIFACTS
// ==========================================
export const MarketingArtifactSchema = z.object({
  id: z.string(),
  runId: z.string(),
  type: z.enum([
    "POSITIONING",
    "LANDING_PAGE_COPY",
    "LAUNCH_POST",
    "CONTENT_CALENDAR",
    "DEMO_SCRIPT",
    "OUTREACH_TEMPLATE",
    "PRICING_COPY",
    "DISTRIBUTION_EXPERIMENT",
  ]),
  title: z.string(),
  content: z.string(),
  targetAudience: z.string(),
  intendedChannel: z.string(),
  groundedClaimIds: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "APPROVED", "PUBLISHED"]).default("DRAFT"),
  createdAt: z.string(),
  isDemo: z.boolean().default(false),
});
export type MarketingArtifact = z.infer<typeof MarketingArtifactSchema>;

// ==========================================
// WORKFLOW EVENT, TASK & APPROVALS
// ==========================================
export const WorkflowEventSchema = z.object({
  id: z.string(),
  runId: z.string(),
  timestamp: z.string(),
  type: z.string(),
  agentRole: AgentRoleIdSchema.optional(),
  stage: WorkflowStageSchema.optional(),
  summary: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  severity: z.enum(["info", "warning", "error", "success"]).default("info"),
});
export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>;

export const ApprovalGateSchema = z.object({
  id: z.string(),
  runId: z.string(),
  type: z.enum([
    "SOLUTION_SPEC",
    "EXPERIMENT_LAUNCH",
    "BUILD_START",
    "DEPLOYMENT",
    "MARKETING_PUBLISH",
    "BUDGET_OVERRUN",
  ]),
  title: z.string(),
  description: z.string(),
  requestedAt: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  decidedBy: z.string().optional(),
  decidedAt: z.string().optional(),
  notes: z.string().optional(),
});
export type ApprovalGate = z.infer<typeof ApprovalGateSchema>;

export const CostRecordSchema = z.object({
  id: z.string(),
  runId: z.string(),
  timestamp: z.string(),
  agentRole: AgentRoleIdSchema,
  modelId: z.string(),
  tokensPrompt: z.number(),
  tokensCompletion: z.number(),
  estimatedCostUSD: z.number(),
  purpose: z.string(),
});
export type CostRecord = z.infer<typeof CostRecordSchema>;

// ==========================================
// RESEARCH RUN
// ==========================================
export const ResearchRunSchema = z.object({
  id: z.string(),
  name: z.string(),
  searchBrief: z.string(),
  targetMarketOrDomain: z.string(),
  geography: z.string().default("Global"),
  constraints: z.object({
    availableCapitalUSD: z.number().default(5000),
    timeToFirstRevenueWeeks: z.number().default(8),
    industriesToAvoid: z.array(z.string()).default([]),
    preferredBusinessModels: z.array(z.string()).default(["B2B SaaS", "Automation Tool"]),
    budgetCeilingUSD: z.number().default(25),
  }),
  currentStage: WorkflowStageSchema.default("search_definition"),
  status: RunStatusSchema.default("CREATED"),
  isDemo: z.boolean().default(false),
  activeAgent: AgentRoleIdSchema.optional(),
  selectedProblemId: z.string().optional(),
  selectedSolutionId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  cumulativeCostUSD: z.number().default(0),
  activeBlocker: z.string().optional(),
});
export type ResearchRun = z.infer<typeof ResearchRunSchema>;

// ==========================================
// SYSTEM SETTINGS & MODEL REGISTRY
// ==========================================
export const ModelRoleConfigSchema = z.object({
  primary: z.string(),
  fallback: z.string(),
  temperature: z.number().min(0).max(2).default(0.3),
  maxTokens: z.number().default(4000),
  supportsStructuredOutput: z.boolean().default(true),
});
export type ModelRoleConfig = z.infer<typeof ModelRoleConfigSchema>;

export const SystemSettingsSchema = z.object({
  openRouterApiKey: z.string().default(""),
  hasApiKey: z.boolean().optional(),
  modelRegistry: z.record(AgentRoleIdSchema, ModelRoleConfigSchema),
  budgets: z.object({
    maxRunCostUSD: z.number().default(20),
    maxStageCostUSD: z.number().default(5),
  }),
  critiqueLimits: z.object({
    maxRounds: z.number().default(3),
    stopOnConsecutiveNoObjections: z.boolean().default(true),
  }),
  sourcesConfig: z.object({
    enableHackerNews: z.boolean().default(true),
    enableGitHub: z.boolean().default(true),
    enableManualImport: z.boolean().default(true),
  }),
  visualPreferences: z.object({
    enableAnimations: z.boolean().default(true),
    soundEffects: z.boolean().default(false),
  }),
});
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;

// ==========================================
// FALKORDB GRAPH LAYER TYPES
// ==========================================
export const GraphSyncStatusSchema = z.enum(["PENDING", "SYNCING", "SYNCED", "FAILED"]);
export type GraphSyncStatus = z.infer<typeof GraphSyncStatusSchema>;

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum([
    "Source",
    "Evidence",
    "Claim",
    "Entity",
    "Problem",
    "Solution",
    "Product",
    "Company",
    "Persona",
    "Workflow",
    "Objection",
  ]),
  projectId: z.string(),
  properties: z.record(z.string(), z.unknown()),
});
export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum([
    "CONTAINS",
    "SUPPORTS",
    "CONTRADICTS",
    "EVIDENCE_FOR",
    "EVIDENCE_AGAINST",
    "CITES",
    "RELATED_TO",
    "AFFECTS",
    "SOLVED_BY",
    "COMPETES_WITH",
    "OFFERED_BY",
    "CHARGES",
    "SERVES",
    "CAUSES",
    "REQUIRES",
    "HAS_OBJECTION",
    "TESTS",
    "VALIDATES",
  ]),
  projectId: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
});
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export type GraphData = z.infer<typeof GraphDataSchema>;

export const GraphStatsSchema = z.object({
  nodeCount: z.number(),
  edgeCount: z.number(),
  sourcesCount: z.number(),
  evidenceCount: z.number(),
  claimsCount: z.number(),
  problemsCount: z.number(),
  solutionsCount: z.number(),
  entitiesCount: z.number(),
  contradictionsCount: z.number(),
  syncStatus: GraphSyncStatusSchema,
  lastSyncedAt: z.string().optional(),
});
export type GraphStats = z.infer<typeof GraphStatsSchema>;

export interface ProvenanceRecord {
  problemId: string;
  problemTitle: string;
  claims: Array<{
    claimId: string;
    claimText: string;
    confidence: number;
    epistemicStatus: string;
    relation: "EVIDENCE_FOR" | "EVIDENCE_AGAINST";
    supportingEvidence: Array<{
      evidenceId: string;
      passage: string;
      epistemicStatus: string;
      sourceTitle: string;
      sourceUrl?: string;
      sourceType: string;
      contentHash: string;
      isDerivative?: boolean;
    }>;
    contradictingEvidence: Array<{
      evidenceId: string;
      passage: string;
      epistemicStatus: string;
      sourceTitle: string;
      sourceUrl?: string;
      sourceType: string;
      contentHash: string;
    }>;
  }>;
}

export interface ContradictionItem {
  claimId: string;
  claimText: string;
  problemId: string;
  problemTitle: string;
  supportingCount: number;
  contradictingCount: number;
  supportingExcerpts: string[];
  contradictingExcerpts: string[];
}
