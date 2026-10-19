import { EvidenceSource, EvidenceItem } from "@/types";
import crypto from "crypto";

export interface SearchQueryOptions {
  query: string;
  runId: string;
  limit?: number;
}

export function generateContentHash(text: string): string {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex").slice(0, 16);
}

// ==========================================
// HACKER NEWS ALGOLIA REAL SOURCE ADAPTER
// ==========================================
export class HackerNewsAdapter {
  static sourceMeta: EvidenceSource = {
    id: "src_hackernews_algolia",
    name: "Hacker News (Algolia Search API)",
    type: "hacker_news",
    url: "https://hn.algolia.com/api",
    termsCompliant: true,
    rateLimitStatus: "OK (Public Search API, 10,000 req/hr)",
    retrievedAt: new Date().toISOString(),
    isDemo: false,
  };

  static async search(options: SearchQueryOptions): Promise<EvidenceItem[]> {
    const { query, runId, limit = 8 } = options;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://hn.algolia.com/api/v1/search?query=${encodedQuery}&tags=(story,comment)&hitsPerPage=${limit}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "ankor-research-scout/1.0",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (!response.ok) {
        throw new Error(`Hacker News API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const hits = data.hits || [];

      const items: EvidenceItem[] = [];
      for (const hit of hits) {
        const text = hit.comment_text || hit.story_text || hit.title || "";
        const cleanText = text.replace(/<[^>]*>?/gm, "").trim(); // strip html tags
        if (!cleanText || cleanText.length < 30) continue;

        const title = hit.story_title || hit.title || "Hacker News Discussion";
        const itemUrl = hit.story_url || (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : undefined);
        const hash = generateContentHash(cleanText);

        items.push({
          id: `ev_hn_${hit.objectID || Date.now()}`,
          runId,
          sourceId: HackerNewsAdapter.sourceMeta.id,
          sourceTitle: title,
          sourceUrl: itemUrl,
          originalExcerpt: cleanText.slice(0, 600),
          relevantPassage: cleanText.slice(0, 300),
          author: hit.author || "hn_user",
          publicationDate: hit.created_at ? new Date(hit.created_at).toISOString().slice(0, 10) : undefined,
          retrievalDate: new Date().toISOString(),
          retrievalMethod: "Hacker News Algolia Search API (Scout)",
          contentHash: hash,
          epistemicStatus: "OBSERVED",
          confidence: 0.85,
          limitations: "Public forum post; may reflect tech-centric or vocal minority bias.",
          isDemo: false,
        });
      }

      return items;
    } catch (err) {
      console.error("[HackerNewsAdapter] Error querying Hacker News API:", err);
      return [];
    }
  }
}

// ==========================================
// GITHUB PUBLIC ISSUES ADAPTER
// ==========================================
export class GitHubAdapter {
  static sourceMeta: EvidenceSource = {
    id: "src_github_issues",
    name: "GitHub Public Issues & Discussions",
    type: "github",
    url: "https://api.github.com",
    termsCompliant: true,
    rateLimitStatus: "OK (Public Search API, 10 req/min unauthenticated)",
    retrievedAt: new Date().toISOString(),
    isDemo: false,
  };

  static async search(options: SearchQueryOptions): Promise<EvidenceItem[]> {
    const { query, runId, limit = 6 } = options;
    const encoded = encodeURIComponent(`${query} is:issue`);
    const url = `https://api.github.com/search/issues?q=${encoded}&per_page=${limit}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "ankor-research-scout/1.0",
          Accept: "application/vnd.github.v3+json",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (!response.ok) {
        console.warn(`[GitHubAdapter] GitHub API status: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const items: EvidenceItem[] = [];

      for (const item of data.items || []) {
        const body = (item.body || "").trim();
        const text = `${item.title}: ${body}`;
        const hash = generateContentHash(text);

        items.push({
          id: `ev_gh_${item.id}`,
          runId,
          sourceId: GitHubAdapter.sourceMeta.id,
          sourceTitle: item.title,
          sourceUrl: item.html_url,
          originalExcerpt: body.slice(0, 600) || item.title,
          relevantPassage: body.slice(0, 300) || item.title,
          author: item.user?.login || "github_user",
          publicationDate: item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : undefined,
          retrievalDate: new Date().toISOString(),
          retrievalMethod: "GitHub Public Issues Search API (Scout)",
          contentHash: hash,
          epistemicStatus: "OBSERVED",
          confidence: 0.88,
          limitations: "Open source repository issue; describes specific technical software symptom.",
          isDemo: false,
        });
      }

      return items;
    } catch (err) {
      console.error("[GitHubAdapter] Error querying GitHub API:", err);
      return [];
    }
  }
}

// ==========================================
// MANUAL DOCUMENT / INTERVIEW IMPORT ADAPTER
// ==========================================
export class ManualImportAdapter {
  static createItem(params: {
    runId: string;
    title: string;
    text: string;
    author?: string;
    url?: string;
  }): EvidenceItem {
    const hash = generateContentHash(params.text);
    return {
      id: `ev_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      runId: params.runId,
      sourceId: "src_manual_import",
      sourceTitle: params.title,
      sourceUrl: params.url,
      originalExcerpt: params.text,
      relevantPassage: params.text.slice(0, 400),
      author: params.author || "User Supplied",
      publicationDate: new Date().toISOString().slice(0, 10),
      retrievalDate: new Date().toISOString(),
      retrievalMethod: "Manual User Ingestion",
      contentHash: hash,
      epistemicStatus: "OBSERVED",
      confidence: 0.9,
      limitations: "Direct user-provided source note or customer interview excerpt.",
      isDemo: false,
    };
  }
}
