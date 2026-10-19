"use client";

import React, { useState } from "react";
import { EvidenceItem, EvidenceSource } from "@/types";
import {
  FileSearch,
  ExternalLink,
  Search,
  Plus,
  Fingerprint,
  Calendar,
  User,
} from "lucide-react";

interface EvidenceViewProps {
  evidence: EvidenceItem[];
  sources?: EvidenceSource[];
  runId: string;
  onImportEvidence: (data: { title: string; text: string; author?: string; url?: string }) => Promise<void>;
  onTriggerSearch: (query: string, source: "hn" | "github") => Promise<void>;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  evidence,
  sources,
  onImportEvidence,
  onTriggerSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEpistemic, setSelectedEpistemic] = useState<string>("ALL");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTitle, setImportTitle] = useState("");
  const [importText, setImportText] = useState("");
  const [importAuthor, setImportAuthor] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEvidence = evidence.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalExcerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.relevantPassage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEpistemic =
      selectedEpistemic === "ALL" || item.epistemicStatus === selectedEpistemic;

    return matchesSearch && matchesEpistemic;
  });

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTitle || !importText) return;
    setIsSubmitting(true);
    try {
      await onImportEvidence({
        title: importTitle,
        text: importText,
        author: importAuthor,
        url: importUrl,
      });
      setShowImportModal(false);
      setImportTitle("");
      setImportText("");
      setImportAuthor("");
      setImportUrl("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEpistemicColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-[#DCFCE7] text-ink";
      case "OBSERVED":
        return "bg-[#FEF08A] text-ink";
      case "INFERRED":
        return "bg-[#DBEAFE] text-ink";
      case "ASSUMED":
        return "bg-[#FEF3C7] text-ink";
      default:
        return "bg-canvas text-ink";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <FileSearch className="w-3.5 h-3.5" /> EVIDENCE ARCHIVE
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Ground Evidence Explorer
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            Principle 1 & 2: Evidence precedes all conclusions. Every claim retains strict provenance, duplicate-detection fingerprints, and explicit epistemic labeling.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onTriggerSearch("developer pain problem", "hn")}
            className="px-3 py-2 border-2 border-ink bg-surface hover:bg-canvas text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Query Live Sources</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 border-2 border-ink bg-forest hover:bg-forest/90 text-white text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Source</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between border-b-2 border-ink pb-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, citations, passages..."
            className="w-full bg-surface border-2 border-ink shadow-[2px_2px_0px_#161716] pl-9 pr-3 py-1.5 text-xs font-mono text-ink focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-muted font-bold uppercase text-[10px] mr-1">Status:</span>
          {["ALL", "VERIFIED", "OBSERVED", "INFERRED", "ASSUMED"].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedEpistemic(s)}
              className={`px-2.5 py-1 border-2 border-ink transition text-[11px] font-bold uppercase ${
                selectedEpistemic === s
                  ? "bg-ink text-white shadow-[2px_2px_0px_#161716]"
                  : "bg-surface hover:bg-canvas text-ink"
              }`}
            >
              {s}
            </button>
          ))}
          <span className="text-muted text-[11px] font-bold ml-2">
            ({filteredEvidence.length} items)
          </span>
        </div>
      </div>

      {/* Evidence Items List */}
      <div className="space-y-4">
        {filteredEvidence.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-ink/40 bg-surface/50 text-muted font-mono text-xs">
            No evidence items match the search query. Try ingesting customer notes or running a source search.
          </div>
        ) : (
          filteredEvidence.map((item) => (
            <div
              key={item.id}
              className="comic-panel p-5 bg-surface space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line-light pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`comic-badge px-2 py-0.5 text-[10px] ${getEpistemicColor(
                      item.epistemicStatus
                    )}`}
                  >
                    {item.epistemicStatus}
                  </span>

                  <span className="text-xs font-mono text-ink font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-muted" /> {item.author || "Source Author"}
                  </span>

                  {item.publicationDate && (
                    <span className="text-xs font-mono text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.publicationDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-muted">
                  <span className="flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5 text-ink" />
                    <span className="font-bold text-ink">HASH: {(item.contentHash || item.id || "verified").slice(0, 10)}</span>
                  </span>
                  <span>CONFIDENCE: {Math.round((item.confidence || 0.8) * 100)}%</span>
                </div>
              </div>

              {/* Source Title & Link */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black font-sans uppercase text-ink leading-snug">
                  {item.sourceTitle}
                </h3>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 border border-ink bg-canvas hover:bg-surface text-ink transition shrink-0"
                    title="Open external source"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Relevant Passage Highlight */}
              <div className="p-3 border-2 border-ink bg-caption text-xs font-mono text-ink leading-relaxed shadow-[2px_2px_0px_#161716]">
                <strong className="block text-ink text-[10px] uppercase font-black tracking-wider mb-1">
                  Synthesized Evidence Passage:
                </strong>
                {item.relevantPassage}
              </div>

              {/* Metadata */}
              <div className="pt-2 border-t border-line-light flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] font-mono text-muted">
                <div>
                  <strong className="text-ink uppercase">Method:</strong> {item.retrievalMethod}
                </div>
                <div>
                  <strong className="text-ink uppercase">Limitations:</strong> {item.limitations}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-panel w-full max-w-lg bg-surface p-6 shadow-[6px_6px_0px_#161716] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="text-lg font-black font-sans uppercase text-ink">Ingest Ground Evidence</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-xs font-mono font-bold uppercase text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-ink mb-1 font-bold uppercase text-[10px]">
                  Source Title / Context
                </label>
                <input
                  type="text"
                  required
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  placeholder="e.g. Lead Engineer Interview Notes"
                  className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink mb-1 font-bold uppercase text-[10px]">
                  Author or Organization
                </label>
                <input
                  type="text"
                  value={importAuthor}
                  onChange={(e) => setImportAuthor(e.target.value)}
                  placeholder="e.g. Lead Architect at Remote Startup"
                  className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink mb-1 font-bold uppercase text-[10px]">
                  External Reference URL (Optional)
                </label>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink mb-1 font-bold uppercase text-[10px]">
                  Raw Excerpt / Verbatim Notes
                </label>
                <textarea
                  required
                  rows={5}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste verbatim customer complaints, quotes, or forum excerpts..."
                  className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t-2 border-ink flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border-2 border-ink bg-surface hover:bg-canvas text-ink font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border-2 border-ink bg-forest hover:bg-forest/90 text-white font-bold uppercase shadow-[2px_2px_0px_#161716]"
                >
                  {isSubmitting ? "Ingesting..." : "Store in Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
