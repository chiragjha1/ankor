import fs from "fs";
import path from "path";
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
  AgentRoleId,
  Claim,
} from "@/types";
import {
  DEFAULT_PERSONAS,
  DEFAULT_SETTINGS,
  DEMO_RUN,
  DEMO_SOURCES,
  DEMO_EVIDENCE,
  DEMO_PROBLEMS,
  DEMO_ECONOMICS,
  DEMO_SOLUTIONS,
  DEMO_OBJECTIONS,
  DEMO_REVISIONS,
  DEMO_FEEDBACKS,
  DEMO_EXPERIMENT,
  DEMO_PRODUCT_SPEC,
  DEMO_MARKETING,
  DEMO_EVENTS,
  DEMO_APPROVALS,
  DEMO_COSTS,
} from "./seedData";

export interface DatabaseSchema {
  version: number;
  settings: SystemSettings;
  runs: ResearchRun[];
  sources: EvidenceSource[];
  evidence: EvidenceItem[];
  claims?: Claim[];
  problems: ProblemCard[];
  economics: EconomicModel[];
  solutions: SolutionSpec[];
  objections: Objection[];
  revisions: SolutionRevision[];
  personas: PersonaTemplate[];
  feedbacks: SimulationFeedback[];
  experiments: ValidationExperiment[];
  productSpecs: ProductSpec[];
  marketing: MarketingArtifact[];
  events: WorkflowEvent[];
  approvals: ApprovalGate[];
  costs: CostRecord[];
}

const STORAGE_DIR = path.join(process.cwd(), ".ankor");
const STORAGE_FILE = path.join(STORAGE_DIR, "storage.json");

// In-memory cache for fast access and listener dispatch
let memoryDb: DatabaseSchema | null = null;
const eventListeners: Array<(event: WorkflowEvent) => void> = [];

function getDefaultDb(): DatabaseSchema {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    runs: [{ ...DEMO_RUN }],
    sources: [...DEMO_SOURCES],
    evidence: [...DEMO_EVIDENCE],
    claims: [],
    problems: [...DEMO_PROBLEMS],
    economics: [{ ...DEMO_ECONOMICS }],
    solutions: [...DEMO_SOLUTIONS],
    objections: [...DEMO_OBJECTIONS],
    revisions: [...DEMO_REVISIONS],
    personas: [...DEFAULT_PERSONAS],
    feedbacks: [...DEMO_FEEDBACKS],
    experiments: [{ ...DEMO_EXPERIMENT }],
    productSpecs: [{ ...DEMO_PRODUCT_SPEC }],
    marketing: [...DEMO_MARKETING],
    events: [...DEMO_EVENTS],
    approvals: [...DEMO_APPROVALS],
    costs: [...DEMO_COSTS],
  };
}

export function getDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, "utf-8");
      memoryDb = JSON.parse(data) as DatabaseSchema;
      return memoryDb;
    }
  } catch (err) {
    console.error("[Storage] Failed to read database from disk, using default seed", err);
  }

  memoryDb = getDefaultDb();
  persistDb(memoryDb);
  return memoryDb;
}

export function persistDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    const content = JSON.stringify(db, null, 2);
    fs.writeFileSync(STORAGE_FILE, content, "utf-8");
  } catch (err) {
    console.error("[Storage] Failed to persist database to disk", err);
  }
}

// ==========================================
// EVENT BUS & LIVE STREAMING
// ==========================================
export function subscribeEvents(listener: (event: WorkflowEvent) => void): () => void {
  eventListeners.push(listener);
  return () => {
    const idx = eventListeners.indexOf(listener);
    if (idx !== -1) eventListeners.splice(idx, 1);
  };
}

export function emitEvent(event: WorkflowEvent): void {
  const db = getDb();
  db.events.unshift(event);
  // Keep last 500 events
  if (db.events.length > 500) {
    db.events = db.events.slice(0, 500);
  }
  persistDb(db);

  for (const listener of eventListeners) {
    try {
      listener(event);
    } catch (err) {
      console.error("[Storage] Error in event listener", err);
    }
  }
}

// ==========================================
// REPOSITORY METHODS
// ==========================================
export const StorageRepository = {
  // Settings
  getSettings(): SystemSettings {
    return getDb().settings;
  },
  updateSettings(partial: Partial<SystemSettings>): SystemSettings {
    const db = getDb();
    db.settings = { ...db.settings, ...partial };
    persistDb(db);
    return db.settings;
  },

  // Runs
  getRuns(): ResearchRun[] {
    return getDb().runs;
  },
  getRun(runId: string): ResearchRun | undefined {
    return getDb().runs.find((r) => r.id === runId);
  },
  upsertRun(run: ResearchRun): ResearchRun {
    const db = getDb();
    const idx = db.runs.findIndex((r) => r.id === run.id);
    if (idx !== -1) {
      const recordedCostsTotal = db.costs
        .filter((c) => c.runId === run.id)
        .reduce((sum, c) => sum + (c.estimatedCostUSD || 0), 0);
      const trueCost = Math.max(
        run.cumulativeCostUSD || 0,
        db.runs[idx]?.cumulativeCostUSD || 0,
        Number(recordedCostsTotal.toFixed(4))
      );
      db.runs[idx] = {
        ...db.runs[idx],
        ...run,
        cumulativeCostUSD: trueCost,
        updatedAt: new Date().toISOString(),
      };
    } else {
      db.runs.unshift(run);
    }
    persistDb(db);
    return run;
  },

  // Sources & Evidence
  getSources(runId?: string): EvidenceSource[] {
    const db = getDb();
    return db.sources;
  },
  addSource(source: EvidenceSource): EvidenceSource {
    const db = getDb();
    if (!db.sources.find((s) => s.id === source.id)) {
      db.sources.push(source);
      persistDb(db);
    }
    return source;
  },
  getEvidence(runId?: string): EvidenceItem[] {
    const db = getDb();
    if (!runId) return db.evidence;
    return db.evidence.filter((e) => e.runId === runId);
  },
  addEvidence(item: EvidenceItem): EvidenceItem {
    const db = getDb();
    const idx = db.evidence.findIndex((e) => e.id === item.id);
    if (idx !== -1) {
      db.evidence[idx] = item;
    } else {
      db.evidence.unshift(item);
    }
    persistDb(db);
    return item;
  },

  // Claims
  getClaims(runId?: string): Claim[] {
    const db = getDb();
    if (!db.claims) db.claims = [];
    if (!runId) return db.claims;
    return db.claims.filter((c) => c.runId === runId);
  },
  addClaim(claim: Claim): Claim {
    const db = getDb();
    if (!db.claims) db.claims = [];
    const idx = db.claims.findIndex((c) => c.id === claim.id);
    if (idx !== -1) {
      db.claims[idx] = claim;
    } else {
      db.claims.unshift(claim);
    }
    persistDb(db);
    return claim;
  },
  getClaim(claimId: string): Claim | undefined {
    const db = getDb();
    if (!db.claims) db.claims = [];
    return db.claims.find((c) => c.id === claimId);
  },

  // Problems
  getProblems(runId?: string): ProblemCard[] {
    const db = getDb();
    if (!runId) return db.problems;
    return db.problems.filter((p) => p.runId === runId);
  },
  getProblem(problemId: string): ProblemCard | undefined {
    return getDb().problems.find((p) => p.id === problemId);
  },
  upsertProblem(problem: ProblemCard): ProblemCard {
    const db = getDb();
    const idx = db.problems.findIndex((p) => p.id === problem.id);
    if (idx !== -1) {
      db.problems[idx] = problem;
    } else {
      db.problems.unshift(problem);
    }
    persistDb(db);
    return problem;
  },

  // Economics
  getEconomics(runId: string): EconomicModel | undefined {
    return getDb().economics.find((e) => e.runId === runId);
  },
  saveEconomics(model: EconomicModel): EconomicModel {
    const db = getDb();
    const idx = db.economics.findIndex((e) => e.id === model.id || e.runId === model.runId);
    if (idx !== -1) {
      db.economics[idx] = model;
    } else {
      db.economics.unshift(model);
    }
    persistDb(db);
    return model;
  },
  upsertEconomicModel(model: EconomicModel): EconomicModel {
    return StorageRepository.saveEconomics(model);
  },

  // Solutions
  getSolutions(runId?: string): SolutionSpec[] {
    const db = getDb();
    if (!runId) return db.solutions;
    return db.solutions.filter((s) => s.runId === runId);
  },
  getSolution(solutionId: string): SolutionSpec | undefined {
    return getDb().solutions.find((s) => s.id === solutionId);
  },
  upsertSolution(solution: SolutionSpec): SolutionSpec {
    const db = getDb();
    const idx = db.solutions.findIndex((s) => s.id === solution.id);
    if (idx !== -1) {
      db.solutions[idx] = solution;
    } else {
      db.solutions.unshift(solution);
    }
    persistDb(db);
    return solution;
  },

  // Objections & Revisions
  getObjections(solutionId?: string): Objection[] {
    const db = getDb();
    if (!solutionId) return db.objections;
    return db.objections.filter((o) => o.solutionId === solutionId);
  },
  addObjection(obj: Objection): Objection {
    const db = getDb();
    const idx = db.objections.findIndex((o) => o.id === obj.id);
    if (idx !== -1) {
      db.objections[idx] = obj;
    } else {
      db.objections.push(obj);
    }
    persistDb(db);
    return obj;
  },
  getRevisions(solutionId: string): SolutionRevision[] {
    return getDb().revisions.filter((r) => r.solutionId === solutionId);
  },
  addRevision(rev: SolutionRevision): SolutionRevision {
    const db = getDb();
    db.revisions.unshift(rev);
    persistDb(db);
    return rev;
  },

  // Personas & Simulations
  getPersonas(): PersonaTemplate[] {
    return getDb().personas;
  },
  getFeedbacks(runId?: string): SimulationFeedback[] {
    const db = getDb();
    if (!runId) return db.feedbacks;
    return db.feedbacks.filter((f) => f.runId === runId);
  },
  addFeedback(feedback: SimulationFeedback): SimulationFeedback {
    const db = getDb();
    const idx = db.feedbacks.findIndex((f) => f.id === feedback.id);
    if (idx !== -1) {
      db.feedbacks[idx] = feedback;
    } else {
      db.feedbacks.push(feedback);
    }
    persistDb(db);
    return feedback;
  },

  // Experiments
  getExperiment(runId: string): ValidationExperiment | undefined {
    return getDb().experiments.find((e) => e.runId === runId);
  },
  saveExperiment(exp: ValidationExperiment): ValidationExperiment {
    const db = getDb();
    const idx = db.experiments.findIndex((e) => e.id === exp.id || e.runId === exp.runId);
    if (idx !== -1) {
      db.experiments[idx] = exp;
    } else {
      db.experiments.unshift(exp);
    }
    persistDb(db);
    return exp;
  },

  // Product Spec & Build
  getProductSpec(runId: string): ProductSpec | undefined {
    return getDb().productSpecs.find((p) => p.runId === runId);
  },
  saveProductSpec(spec: ProductSpec): ProductSpec {
    const db = getDb();
    const idx = db.productSpecs.findIndex((p) => p.id === spec.id || p.runId === spec.runId);
    if (idx !== -1) {
      db.productSpecs[idx] = spec;
    } else {
      db.productSpecs.unshift(spec);
    }
    persistDb(db);
    return spec;
  },

  // Marketing
  getMarketing(runId?: string): MarketingArtifact[] {
    const db = getDb();
    if (!runId) return db.marketing;
    return db.marketing.filter((m) => m.runId === runId);
  },
  saveMarketing(item: MarketingArtifact): MarketingArtifact {
    const db = getDb();
    const idx = db.marketing.findIndex((m) => m.id === item.id);
    if (idx !== -1) {
      db.marketing[idx] = item;
    } else {
      db.marketing.unshift(item);
    }
    persistDb(db);
    return item;
  },

  // Events
  getEvents(runId?: string): WorkflowEvent[] {
    const db = getDb();
    if (!runId) return db.events;
    return db.events.filter((e) => e.runId === runId);
  },
  logEvent(event: WorkflowEvent): void {
    emitEvent(event);
  },

  // Approvals
  getApprovals(runId?: string): ApprovalGate[] {
    const db = getDb();
    if (!runId) return db.approvals;
    return db.approvals.filter((a) => a.runId === runId);
  },
  createApproval(appr: ApprovalGate): ApprovalGate {
    const db = getDb();
    db.approvals.unshift(appr);
    persistDb(db);
    return appr;
  },
  resolveApproval(approvalId: string, status: "APPROVED" | "REJECTED", notes?: string): ApprovalGate | undefined {
    const db = getDb();
    const item = db.approvals.find((a) => a.id === approvalId);
    if (item) {
      item.status = status;
      item.decidedAt = new Date().toISOString();
      item.notes = notes;
      persistDb(db);
    }
    return item;
  },

  // Costs
  getCosts(runId?: string): CostRecord[] {
    const db = getDb();
    if (!runId) return db.costs;
    return db.costs.filter((c) => c.runId === runId);
  },
  recordCost(cost: CostRecord): void {
    const db = getDb();
    db.costs.unshift(cost);
    const run = db.runs.find((r) => r.id === cost.runId);
    if (run) {
      run.cumulativeCostUSD = Number((run.cumulativeCostUSD + cost.estimatedCostUSD).toFixed(4));
    }
    persistDb(db);
  },

  // Reset to default seed
  resetDemo(): void {
    memoryDb = getDefaultDb();
    persistDb(memoryDb);
  },
};
