import {
  EpistemicStatus,
  AgentRoleId,
  GraphSyncStatus,
  GraphNode,
  GraphEdge,
  GraphData,
  GraphStats,
  ProvenanceRecord,
  ContradictionItem,
} from "@/types";

export interface FalkorDBConfig {
  url: string;
  username?: string;
  password?: string;
  database: string;
}

export interface FalkorDBHealth {
  connected: boolean;
  database: string;
  url: string;
  latencyMs: number;
  serverVersion?: string;
  error?: string;
  nodeCount: number;
  edgeCount: number;
}

export interface NodeBaseProps {
  id: string;
  project_id: string;
  created_at: string;
  updated_at?: string;
}

export interface SourceNodeProps extends NodeBaseProps {
  name: string;
  type: string;
  url?: string;
  terms_compliant: boolean;
  rate_limit_status?: string;
}

export interface EvidenceNodeProps extends NodeBaseProps {
  source_id: string;
  source_title: string;
  source_url?: string;
  excerpt: string;
  relevant_passage: string;
  author?: string;
  publication_date?: string;
  retrieval_date: string;
  retrieval_method: string;
  content_hash: string;
  epistemic_status: EpistemicStatus;
  confidence: number;
  limitations: string;
}

export interface ClaimNodeProps extends NodeBaseProps {
  text: string;
  epistemic_status: EpistemicStatus;
  confidence: number;
  explanation: string;
  unresolved_uncertainty?: string;
  created_by?: string;
}

export interface EntityNodeProps extends NodeBaseProps {
  name: string;
  category: "tool" | "competitor" | "technology" | "workflow" | "concept" | "metric";
  frequency: number;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface ProblemNodeProps extends NodeBaseProps {
  title: string;
  customer_segment: string;
  job_to_be_done: string;
  current_workflow: string;
  pain_and_consequences: string;
  time_lost_hours: number;
  money_lost_usd: number;
  confidence_score: number;
  commercial_rating: string;
  status: string;
}

export interface SolutionNodeProps extends NodeBaseProps {
  problem_id: string;
  version: number;
  title: string;
  primary_user: string;
  core_jtbd: string;
  feasibility: string;
  value_delivered: string;
}

export interface PersonaNodeProps extends NodeBaseProps {
  name: string;
  role_title: string;
  company_size: string;
  technical_proficiency: string;
}

export interface ObjectionNodeProps extends NodeBaseProps {
  solution_id: string;
  category: string;
  severity: string;
  argument: string;
  is_blocking: boolean;
}

export interface EvidenceRetrievalOptions {
  projectId: string;
  query?: string;
  role?: AgentRoleId;
  entities?: string[];
  problemIds?: string[];
  evidenceClasses?: EpistemicStatus[];
  limit?: number;
  includeContradictions?: boolean;
  includeProvenance?: boolean;
}

export interface EvidenceContextResult {
  formattedContext: string;
  retrievedClaimsCount: number;
  retrievedSourcesCount: number;
  retrievedEvidenceCount: number;
  contradictionsCount: number;
  entitiesCount: number;
  provenanceSummary: string[];
  rawClaims: ClaimNodeProps[];
  rawEvidence: EvidenceNodeProps[];
}
