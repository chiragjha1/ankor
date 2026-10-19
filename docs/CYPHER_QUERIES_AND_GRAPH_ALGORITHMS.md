# ankor: OpenCypher Queries & Graph Algorithms Reference

This document serves as the technical reference for all OpenCypher graph queries, relationship topologies, traversal patterns, and graph reasoning algorithms utilized across the **ankor** commercial validation engine and its **FalkorDB** knowledge graph layer.

---

## 1. Architectural Philosophy

In ankor, **PostgreSQL** serves as the transactional system of record (runs, agent workflows, events, approval gates, cost ledgers, and solution specifications), while **FalkorDB** serves as the high-throughput, low-latency graph reasoning and retrieval engine.

The graph answers questions that relational queries struggle with:
- What independent evidence lines corroborate or refute this claim?
- Which sources are independent vs. derivative echoes citing the same upstream source?
- What conflicting counter-evidence refutes the customer problem statement?
- Which entities (technologies, competitors, workflows, roles) recurrently cluster around this customer friction?
- What is the complete cryptographic provenance trail from an executive conclusion down to the original passage and URL?

---

## 2. Graph Data Model & Schema

### Node Labels

| Label | Primary Key (`id`) | Key Properties | Description |
|---|---|---|---|
| `Source` | String (e.g. `src_hn_01`) | `name`, `type`, `url`, `terms_compliant`, `rate_limit_status`, `project_id` | Originating publication or platform |
| `Evidence` | String (e.g. `ev_ai_...`) | `source_id`, `source_title`, `source_url`, `excerpt`, `relevant_passage`, `author`, `retrieval_method`, `content_hash`, `epistemic_status`, `confidence`, `limitations`, `project_id` | Raw text excerpt with metadata |
| `Claim` | String (e.g. `claim_...`) | `text`, `epistemic_status`, `confidence`, `explanation`, `unresolved_uncertainty`, `project_id` | Atomic factual assertion synthesized by agents |
| `Problem` | String (e.g. `prob_...`) | `title`, `customer_segment`, `job_to_be_done`, `current_workflow`, `pain_and_consequences`, `time_lost_hours`, `money_lost_usd`, `confidence_score`, `commercial_rating`, `status`, `project_id` | Validated customer problem anchor |
| `Entity` | String (e.g. `ent_...`) | `name`, `category`, `frequency`, `project_id` | Named technology, competitor, role, or concept |
| `Solution` | String (e.g. `sol_...`) | `problem_id`, `version`, `title`, `primary_user`, `core_jtbd`, `feasibility`, `value_delivered`, `project_id` | Iterative product architecture proposal |
| `Objection` | String (e.g. `obj_...`) | `solution_id`, `category`, `severity`, `argument`, `is_blocking`, `project_id` | Adversarial counter-argument raised by Critic |
| `Product` | String (e.g. `prod_...`) | `name`, `category`, `project_id` | Existing commercial alternative or competitor |
| `Price` | String (e.g. `pr_...`) | `amount_usd`, `billing_period`, `project_id` | Pricing model anchor for willingness-to-pay |

### Relationship Topologies

```text
(Source)-[:CONTAINS]->(Evidence)
(Evidence)-[:SUPPORTS]->(Claim)
(Evidence)-[:CONTRADICTS]->(Claim)
(Claim)-[:EVIDENCE_FOR]->(Problem)
(Claim)-[:EVIDENCE_AGAINST]->(Problem)
(Source)-[:CITES]->(Source)
(Entity)-[:RELATED_TO]->(Claim)
(Problem)-[:SOLVED_BY]->(Solution)
(Problem)-[:HAS_OBJECTION]->(Objection)
(Solution)-[:COMPETES_WITH]->(Product)
(Product)-[:CHARGES]->(Price)
(Problem)-[:RELATED_TO]->(Problem)
```

---

## 3. Core OpenCypher Queries

### 3.1 Node Ingestion & Idempotent Upserts

All mutations utilize `MERGE` on the composite key `{id, project_id}` to ensure idempotency across distributed agents, worker retries, and offline reconciliations.

#### Source Ingestion
```cypher
MERGE (s:Source {id: $id, project_id: $projectId})
ON CREATE SET 
  s.name = $name,
  s.type = $type,
  s.url = $url,
  s.terms_compliant = $terms_compliant,
  s.rate_limit_status = $rate_limit_status,
  s.created_at = $created_at
ON MATCH SET 
  s.name = $name,
  s.terms_compliant = $terms_compliant,
  s.updated_at = $updated_at
RETURN s
```

#### Evidence Ingestion
```cypher
MERGE (e:Evidence {id: $id, project_id: $projectId})
ON CREATE SET 
  e.source_id = $source_id,
  e.source_title = $source_title,
  e.source_url = $source_url,
  e.excerpt = $excerpt,
  e.relevant_passage = $relevant_passage,
  e.author = $author,
  e.retrieval_method = $retrieval_method,
  e.content_hash = $content_hash,
  e.epistemic_status = $epistemic_status,
  e.confidence = $confidence,
  e.limitations = $limitations,
  e.created_at = $created_at
ON MATCH SET 
  e.confidence = $confidence,
  e.epistemic_status = $epistemic_status,
  e.updated_at = $updated_at
RETURN e
```

#### Claim Ingestion
```cypher
MERGE (c:Claim {id: $id, project_id: $projectId})
ON CREATE SET 
  c.text = $text,
  c.epistemic_status = $epistemic_status,
  c.confidence = $confidence,
  c.explanation = $explanation,
  c.unresolved_uncertainty = $unresolved_uncertainty,
  c.created_at = $created_at
ON MATCH SET 
  c.text = $text,
  c.confidence = $confidence,
  c.epistemic_status = $epistemic_status,
  c.updated_at = $updated_at
RETURN c
```

#### Problem Anchor Ingestion
```cypher
MERGE (p:Problem {id: $id, project_id: $projectId})
ON CREATE SET 
  p.title = $title,
  p.customer_segment = $customer_segment,
  p.job_to_be_done = $job_to_be_done,
  p.current_workflow = $current_workflow,
  p.pain_and_consequences = $pain_and_consequences,
  p.time_lost_hours = $time_lost_hours,
  p.money_lost_usd = $money_lost_usd,
  p.confidence_score = $confidence_score,
  p.commercial_rating = $commercial_rating,
  p.status = $status,
  p.created_at = $created_at
ON MATCH SET 
  p.title = $title,
  p.customer_segment = $customer_segment,
  p.confidence_score = $confidence_score,
  p.updated_at = $updated_at
RETURN p
```

---

### 3.2 Relationship Edge Linking

#### Source Contains Evidence
```cypher
MATCH (s:Source {id: $sourceId, project_id: $projectId})
MATCH (e:Evidence {id: $evidenceId, project_id: $projectId})
MERGE (s)-[r:CONTAINS]->(e)
RETURN r
```

#### Evidence Supports Claim
```cypher
MATCH (e:Evidence {id: $evidenceId, project_id: $projectId})
MATCH (c:Claim {id: $claimId, project_id: $projectId})
MERGE (e)-[r:SUPPORTS]->(c)
RETURN r
```

#### Evidence Contradicts Claim (Adversarial Detection)
```cypher
MATCH (e:Evidence {id: $evidenceId, project_id: $projectId})
MATCH (c:Claim {id: $claimId, project_id: $projectId})
MERGE (e)-[r:CONTRADICTS]->(c)
RETURN r
```

#### Claim Supports / Refutes Problem
```cypher
// Support
MATCH (c:Claim {id: $claimId, project_id: $projectId})
MATCH (p:Problem {id: $problemId, project_id: $projectId})
MERGE (c)-[r:EVIDENCE_FOR]->(p)
RETURN r

// Refutation / Counter-evidence
MATCH (c:Claim {id: $claimId, project_id: $projectId})
MATCH (p:Problem {id: $problemId, project_id: $projectId})
MERGE (c)-[r:EVIDENCE_AGAINST]->(p)
RETURN r
```

---

### 3.3 Graph Retrieval & Lineage Traversal

#### Deep Provenance Trace
Reconstructs the hierarchical provenance tree from a Problem down to Claims, supporting and refuting Evidence, and originating Sources.

```cypher
MATCH (p:Problem {id: $problemId, project_id: $projectId})
MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR|EVIDENCE_AGAINST]->(p)
OPTIONAL MATCH (eSup:Evidence {project_id: $projectId})-[:SUPPORTS]->(c)
OPTIONAL MATCH (sSup:Source {project_id: $projectId})-[:CONTAINS]->(eSup)
OPTIONAL MATCH (eCon:Evidence {project_id: $projectId})-[:CONTRADICTS]->(c)
OPTIONAL MATCH (sCon:Source {project_id: $projectId})-[:CONTAINS]->(eCon)
RETURN p, c, eSup, sSup, eCon, sCon
```

#### Contradiction Discovery
Identifies points of friction where empirical customer excerpts oppose an established claim or problem hypothesis.

```cypher
MATCH (p:Problem {id: $problemId, project_id: $projectId})
MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR|EVIDENCE_AGAINST]->(p)
MATCH (e:Evidence {project_id: $projectId})-[:CONTRADICTS]->(c)
OPTIONAL MATCH (s:Source {project_id: $projectId})-[:CONTAINS]->(e)
RETURN c, e, s
LIMIT $limit
```

#### Independent Source Verification (Echo-Chamber Elimination)
Distinguishes genuinely independent sources from derivative circular reporting by checking for citations or republication links.

```cypher
MATCH (p:Problem {id: $problemId, project_id: $projectId})
MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR]->(p)
MATCH (e:Evidence {project_id: $projectId})-[:SUPPORTS]->(c)
MATCH (s:Source {project_id: $projectId})-[:CONTAINS]->(e)
WHERE NOT (s)-[:CITES]->()
RETURN DISTINCT s
LIMIT $limit
```

#### Entity Clustering & Problem Associations
Ranks technical entities and workflows most frequently co-occurring in evidence supporting the problem.

```cypher
MATCH (p:Problem {id: $problemId, project_id: $projectId})
MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR]->(p)
MATCH (ent:Entity {project_id: $projectId})-[:RELATED_TO]->(c)
RETURN ent, count(c) as claimCount
ORDER BY claimCount DESC
LIMIT $limit
```

#### Competitive Landscape & Pricing Benchmark
Extracts incumbent solutions and pricing models competing with the target value proposition.

```cypher
MATCH (p:Problem {id: $problemId, project_id: $projectId})
MATCH (p)-[:SOLVED_BY]->(sol:Solution)-[:COMPETES_WITH]->(prod:Product)
OPTIONAL MATCH (prod)-[:CHARGES]->(pr:Price)
RETURN prod, pr
```

#### Multi-Hop Cross-Investigation Discovery
Finds related problem statements across distinct investigative runs without project boundary restrictions.

```cypher
MATCH (p:Problem {id: $problemId})
MATCH (p)-[:RELATED_TO*1..2]-(related:Problem)
WHERE related.id <> $problemId
RETURN DISTINCT related
LIMIT $limit
```

#### Visualization Subgraph Snapshot
Extracts active project nodes and edges for rendering in the interactive Graph Canvas.

```cypher
MATCH (n {project_id: $projectId})
OPTIONAL MATCH (n)-[r]->(m {project_id: $projectId})
RETURN n, r, m
LIMIT 200
```

---

## 4. Graph Algorithms & Epistemic Reasoning

### 4.1 Epistemic Status Hierarchy

Every Evidence and Claim node is classified under strict epistemology:

$$\text{OBSERVED} \succ \text{VERIFIED} \succ \text{INFERRED} \succ \text{ASSUMED} \succ \text{SIMULATED} \succ \text{UNKNOWN}$$

- **OBSERVED**: Direct verbatim quote from customer review, support ticket, or forum thread.
- **VERIFIED**: Independently corroborated by $\ge 2$ distinct non-citing sources.
- **INFERRED**: Deductive conclusion drawn by analytical reasoning.
- **ASSUMED**: Unverified baseline hypothesis.
- **SIMULATED**: Output generated by synthetic persona runs.
- **UNKNOWN**: Source unclassified or unverified.

Agents are strictly barred from silently converting lower statuses to higher ones (e.g. `SIMULATED` cannot be promoted to `OBSERVED`).

### 4.2 Deterministic Confidence Calculation

The system computes confidence without hallucination using a bounded deterministic formula:

$$\text{Base Confidence} = \sum_{i=1}^{k} w(E_i) \cdot \alpha(S_i)$$

Where:
- $w(E_i)$ is the epistemic weight of evidence item $i$ (`OBSERVED = 1.0`, `VERIFIED = 0.9`, `INFERRED = 0.7`, `ASSUMED = 0.4`, `SIMULATED = 0.2`).
- $\alpha(S_i)$ is the source independence factor:
  - $\alpha = 1.0$ if the source does not cite any other included source.
  - $\alpha = 0.35$ if the source is derivative or an echo of an already included source.
- Contradiction penalty: If any evidence item has an active `CONTRADICTS` relationship, the claim confidence is attenuated by a factor proportional to the contradiction severity ($0.50 \times$).

### 4.3 Provenance Cryptographic Verification

To guarantee that evidence has not been tampered with or fabricated during agent reasoning:
1. Every excerpt is hashed at ingestion using SHA-256:
   $$\text{content\_hash} = \text{SHA256}(\text{sourceId} + ":" + \text{normalized\_excerpt})$$
2. The hash is written to the `Evidence` node in FalkorDB and duplicated in the PostgreSQL evidence ledger.
3. Upon retrieval, agents and frontend provenance drawers verify that the text matches the recorded hash.

### 4.4 Bounded Hybrid Retrieval

Instead of flooding LLM agent prompts with entire graph documents, ankor executes multi-stage bounded retrieval:
1. **Target Selection**: Extract semantic keywords and problem anchors from the agent task prompt.
2. **Graph Traversal**: Execute Cypher traversals to gather 1-hop and 2-hop connected Claims, Evidence, and Objections.
3. **Contradiction Partitioning**: Explicitly isolate `CONTRADICTS` and `EVIDENCE_AGAINST` paths.
4. **Delimited Context Assembly**: Wrap retrieved evidence inside secure prompt delimiters (`--- BEGIN EVIDENCE STREAM ---`) with strict system directives instructing the model to treat content purely as untrusted data.
