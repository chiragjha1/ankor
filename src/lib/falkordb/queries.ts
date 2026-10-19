export const CYPHER_QUERIES = {
  // ==========================================
  // NODE UPSERTS (IDEMPOTENT MERGE)
  // ==========================================
  UPSERT_SOURCE: `
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
  `,

  UPSERT_EVIDENCE: `
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
  `,

  UPSERT_CLAIM: `
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
  `,

  UPSERT_PROBLEM: `
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
  `,

  UPSERT_ENTITY: `
    MERGE (ent:Entity {id: $id, project_id: $projectId})
    ON CREATE SET 
      ent.name = $name,
      ent.category = $category,
      ent.frequency = $frequency,
      ent.created_at = $created_at
    ON MATCH SET 
      ent.frequency = ent.frequency + 1,
      ent.updated_at = $updated_at
    RETURN ent
  `,

  UPSERT_SOLUTION: `
    MERGE (sol:Solution {id: $id, project_id: $projectId})
    ON CREATE SET 
      sol.problem_id = $problem_id,
      sol.version = $version,
      sol.title = $title,
      sol.primary_user = $primary_user,
      sol.core_jtbd = $core_jtbd,
      sol.feasibility = $feasibility,
      sol.value_delivered = $value_delivered,
      sol.created_at = $created_at
    ON MATCH SET 
      sol.title = $title,
      sol.version = $version,
      sol.updated_at = $updated_at
    RETURN sol
  `,

  UPSERT_OBJECTION: `
    MERGE (obj:Objection {id: $id, project_id: $projectId})
    ON CREATE SET 
      obj.solution_id = $solution_id,
      obj.category = $category,
      obj.severity = $severity,
      obj.argument = $argument,
      obj.is_blocking = $is_blocking,
      obj.created_at = $created_at
    ON MATCH SET 
      obj.severity = $severity,
      obj.is_blocking = $is_blocking,
      obj.updated_at = $updated_at
    RETURN obj
  `,

  // ==========================================
  // RELATIONSHIP EDGES (IDEMPOTENT MERGE)
  // ==========================================
  LINK_SOURCE_CONTAINS_EVIDENCE: `
    MATCH (s:Source {id: $sourceId, project_id: $projectId})
    MATCH (e:Evidence {id: $evidenceId, project_id: $projectId})
    MERGE (s)-[r:CONTAINS]->(e)
    RETURN r
  `,

  LINK_EVIDENCE_SUPPORTS_CLAIM: `
    MATCH (e:Evidence {id: $evidenceId, project_id: $projectId})
    MATCH (c:Claim {id: $claimId, project_id: $projectId})
    MERGE (e)-[r:SUPPORTS]->(c)
    RETURN r
  `,

  LINK_EVIDENCE_CONTRADICTS_CLAIM: `
    MATCH (e:Evidence {id: $evidenceId, project_id: $projectId})
    MATCH (c:Claim {id: $claimId, project_id: $projectId})
    MERGE (e)-[r:CONTRADICTS]->(c)
    RETURN r
  `,

  LINK_CLAIM_EVIDENCE_FOR_PROBLEM: `
    MATCH (c:Claim {id: $claimId, project_id: $projectId})
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MERGE (c)-[r:EVIDENCE_FOR]->(p)
    RETURN r
  `,

  LINK_CLAIM_EVIDENCE_AGAINST_PROBLEM: `
    MATCH (c:Claim {id: $claimId, project_id: $projectId})
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MERGE (c)-[r:EVIDENCE_AGAINST]->(p)
    RETURN r
  `,

  LINK_SOURCE_CITES_SOURCE: `
    MATCH (s1:Source {id: $sourceId1, project_id: $projectId})
    MATCH (s2:Source {id: $sourceId2, project_id: $projectId})
    MERGE (s1)-[r:CITES]->(s2)
    RETURN r
  `,

  LINK_ENTITY_RELATED_TO_CLAIM: `
    MATCH (ent:Entity {id: $entityId, project_id: $projectId})
    MATCH (c:Claim {id: $claimId, project_id: $projectId})
    MERGE (ent)-[r:RELATED_TO]->(c)
    RETURN r
  `,

  LINK_PROBLEM_SOLVED_BY: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (sol:Solution {id: $solutionId, project_id: $projectId})
    MERGE (p)-[r:SOLVED_BY]->(sol)
    RETURN r
  `,

  LINK_PROBLEM_HAS_OBJECTION: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (obj:Objection {id: $objectionId, project_id: $projectId})
    MERGE (p)-[r:HAS_OBJECTION]->(obj)
    RETURN r
  `,

  // ==========================================
  // RETRIEVAL & PROVENANCE TRAVERSALS
  // ==========================================
  FIND_EVIDENCE_SUPPORTING_PROBLEM: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR]->(p)
    MATCH (e:Evidence {project_id: $projectId})-[:SUPPORTS]->(c)
    OPTIONAL MATCH (s:Source {project_id: $projectId})-[:CONTAINS]->(e)
    RETURN c, e, s
    ORDER BY c.confidence DESC, e.confidence DESC
    LIMIT $limit
  `,

  FIND_CONTRADICTIONS_FOR_PROBLEM: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR|EVIDENCE_AGAINST]->(p)
    MATCH (e:Evidence {project_id: $projectId})-[:CONTRADICTS]->(c)
    OPTIONAL MATCH (s:Source {project_id: $projectId})-[:CONTAINS]->(e)
    RETURN c, e, s
    LIMIT $limit
  `,

  TRACE_FULL_PROVENANCE: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR|EVIDENCE_AGAINST]->(p)
    OPTIONAL MATCH (eSup:Evidence {project_id: $projectId})-[:SUPPORTS]->(c)
    OPTIONAL MATCH (sSup:Source {project_id: $projectId})-[:CONTAINS]->(eSup)
    OPTIONAL MATCH (eCon:Evidence {project_id: $projectId})-[:CONTRADICTS]->(c)
    OPTIONAL MATCH (sCon:Source {project_id: $projectId})-[:CONTAINS]->(eCon)
    RETURN p, c, eSup, sSup, eCon, sCon
  `,

  FIND_ENTITIES_FOR_PROBLEM: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR]->(p)
    MATCH (ent:Entity {project_id: $projectId})-[:RELATED_TO]->(c)
    RETURN ent, count(c) as claimCount
    ORDER BY claimCount DESC
    LIMIT $limit
  `,

  FIND_INDEPENDENT_SOURCES: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (c:Claim {project_id: $projectId})-[:EVIDENCE_FOR]->(p)
    MATCH (e:Evidence {project_id: $projectId})-[:SUPPORTS]->(c)
    MATCH (s:Source {project_id: $projectId})-[:CONTAINS]->(e)
    WHERE NOT (s)-[:CITES]->()
    RETURN DISTINCT s
    LIMIT $limit
  `,

  PROJECT_GRAPH_SNAPSHOT: `
    MATCH (n {project_id: $projectId})
    OPTIONAL MATCH (n)-[r]->(m {project_id: $projectId})
    RETURN n, r, m
    LIMIT 200
  `,

  PROJECT_GRAPH_STATS: `
    MATCH (n {project_id: $projectId})
    RETURN labels(n) as label, count(n) as count
  `,

  // ==========================================
  // COMMERCIAL & COMPETITIVE PRODUCT QUERIES
  // ==========================================
  UPSERT_PRODUCT: `
    MERGE (prod:Product {id: $id, project_id: $projectId})
    ON CREATE SET 
      prod.name = $name,
      prod.category = $category,
      prod.created_at = $created_at
    ON MATCH SET 
      prod.name = $name,
      prod.updated_at = $updated_at
    RETURN prod
  `,

  UPSERT_PRICE: `
    MERGE (pr:Price {id: $id, project_id: $projectId})
    ON CREATE SET 
      pr.amount_usd = $amount_usd,
      pr.billing_period = $billing_period,
      pr.created_at = $created_at
    RETURN pr
  `,

  LINK_SOLUTION_COMPETES_WITH_PRODUCT: `
    MATCH (sol:Solution {id: $solutionId, project_id: $projectId})
    MATCH (prod:Product {id: $productId, project_id: $projectId})
    MERGE (sol)-[r:COMPETES_WITH]->(prod)
    RETURN r
  `,

  LINK_PRODUCT_CHARGES_PRICE: `
    MATCH (prod:Product {id: $productId, project_id: $projectId})
    MATCH (pr:Price {id: $priceId, project_id: $projectId})
    MERGE (prod)-[r:CHARGES]->(pr)
    RETURN r
  `,

  LINK_PROBLEM_RELATED_TO_PROBLEM: `
    MATCH (p1:Problem {id: $problemId1})
    MATCH (p2:Problem {id: $problemId2})
    MERGE (p1)-[r:RELATED_TO]->(p2)
    RETURN r
  `,

  FIND_COMPETITORS_FOR_PROBLEM: `
    MATCH (p:Problem {id: $problemId, project_id: $projectId})
    MATCH (p)-[:SOLVED_BY]->(sol:Solution)-[:COMPETES_WITH]->(prod:Product)
    OPTIONAL MATCH (prod)-[:CHARGES]->(pr:Price)
    RETURN prod, pr
  `,

  FIND_RELATED_PROBLEMS_ACROSS_INVESTIGATIONS: `
    MATCH (p:Problem {id: $problemId})
    MATCH (p)-[:RELATED_TO*1..2]-(related:Problem)
    WHERE related.id <> $problemId
    RETURN DISTINCT related
    LIMIT $limit
  `,
};
