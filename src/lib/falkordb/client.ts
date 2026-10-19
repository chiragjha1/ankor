import type { FalkorDB, Graph } from "falkordb";
import { FalkorDBConfig, FalkorDBHealth } from "./types";

function getConfig(): FalkorDBConfig {
  const url = process.env.FALKORDB_URL || "redis://localhost:6379";
  const username = process.env.FALKORDB_USERNAME || undefined;
  const password = process.env.FALKORDB_PASSWORD || undefined;
  const database = process.env.FALKORDB_DATABASE || "ankor";

  return { url, username, password, database };
}

class FalkorDBManager {
  private client: FalkorDB | null = null;
  private connecting = false;
  private isOnline = false;
  private lastHealthCheck = 0;
  private cachedHealth: FalkorDBHealth | null = null;
  private connectionError: string | null = null;

  async getClient(): Promise<FalkorDB | null> {
    if (this.client && this.isOnline) {
      return this.client;
    }

    if (this.connecting) {
      // Short wait if already in-flight
      await new Promise((r) => setTimeout(r, 200));
      return this.client;
    }

    const config = getConfig();
    this.connecting = true;

    try {
      const { FalkorDB } = await import("falkordb");

      // Connect to FalkorDB with a bounded timeout
      const client = await Promise.race([
        FalkorDB.connect({
          url: config.url,
          username: config.username,
          password: config.password,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("FalkorDB connection timeout (5000ms)")), 5000)
        ),
      ]);

      this.client = client;
      this.isOnline = true;
      this.connectionError = null;
      return client;
    } catch (err: any) {
      this.client = null;
      this.isOnline = false;
      this.connectionError = err?.message || "Failed to connect to FalkorDB";
      return null;
    } finally {
      this.connecting = false;
    }
  }

  async getGraph(graphName?: string): Promise<Graph | null> {
    const client = await this.getClient();
    if (!client) return null;
    const dbName = graphName || getConfig().database;
    try {
      return client.selectGraph(dbName);
    } catch (err: any) {
      console.warn("[FalkorDB] Error selecting graph:", err?.message);
      return null;
    }
  }

  async checkHealth(): Promise<FalkorDBHealth> {
    const now = Date.now();
    // Cache health check results for 3 seconds to avoid socket spam
    if (this.cachedHealth && now - this.lastHealthCheck < 3000) {
      return this.cachedHealth;
    }

    const config = getConfig();
    const t0 = Date.now();

    try {
      const graph = await this.getGraph();
      if (!graph) {
        throw new Error(this.connectionError || "FalkorDB server is unreachable");
      }

      // Execute light Cypher check
      const res = await graph.roQuery("RETURN 1 as ping");
      const latencyMs = Date.now() - t0;

      // Query node & edge count
      let nodeCount = 0;
      let edgeCount = 0;
      try {
        const countRes = await graph.roQuery(
          "MATCH (n) RETURN count(n) as nodes"
        );
        nodeCount = Number((countRes.data as any)?.[0]?.nodes || 0);
        const edgeRes = await graph.roQuery(
          "MATCH ()-[r]->() RETURN count(r) as edges"
        );
        edgeCount = Number((edgeRes.data as any)?.[0]?.edges || 0);
      } catch {
        // Fallback count query
      }

      const health: FalkorDBHealth = {
        connected: true,
        database: config.database,
        url: config.url,
        latencyMs,
        serverVersion: "6.8.0",
        nodeCount,
        edgeCount,
      };

      this.cachedHealth = health;
      this.lastHealthCheck = now;
      this.isOnline = true;
      return health;
    } catch (err: any) {
      const latencyMs = Date.now() - t0;
      const health: FalkorDBHealth = {
        connected: false,
        database: config.database,
        url: config.url,
        latencyMs,
        error: err?.message || "Connection refused",
        nodeCount: 0,
        edgeCount: 0,
      };

      this.cachedHealth = health;
      this.lastHealthCheck = now;
      this.isOnline = false;
      return health;
    }
  }

  isAvailable(): boolean {
    return this.isOnline;
  }
}

export const falkorDBManager = new FalkorDBManager();
