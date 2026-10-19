"use client";

import React, { useState } from "react";
import { X, Compass, Plus } from "lucide-react";

interface NewRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    searchBrief: string;
    targetMarketOrDomain: string;
    geography: string;
    budgetCeilingUSD: number;
    timeToFirstRevenueWeeks: number;
  }) => Promise<void>;
}

export const NewRunModal: React.FC<NewRunModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [targetMarketOrDomain, setTargetMarketOrDomain] = useState("");
  const [searchBrief, setSearchBrief] = useState("");
  const [geography, setGeography] = useState("Global (Remote Teams)");
  const [budgetCeilingUSD, setBudgetCeilingUSD] = useState(25);
  const [timeToFirstRevenueWeeks, setTimeToFirstRevenueWeeks] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !searchBrief || !targetMarketOrDomain) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        searchBrief,
        targetMarketOrDomain,
        geography,
        budgetCeilingUSD,
        timeToFirstRevenueWeeks,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillExample = (exName: string, domain: string, brief: string) => {
    setName(exName);
    setTargetMarketOrDomain(domain);
    setSearchBrief(brief);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="comic-panel w-full max-w-xl bg-surface p-6 shadow-[6px_6px_0px_#161716] space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b-2 border-ink pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-ink bg-[#FEF08A] text-ink flex items-center justify-center shadow-[2px_2px_0px_#161716]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black font-sans uppercase text-ink">Launch Investigation Brief</h3>
              <p className="text-[10px] font-mono text-muted uppercase font-bold">Stage 1: Define Parameters</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 border border-ink bg-canvas hover:bg-surface text-ink transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5 text-xs font-mono">
          <span className="text-[10px] text-ink uppercase font-black tracking-wider">Example Templates:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                fillExample(
                  "Database Migration & Seed Sync",
                  "Developer Tools / Fullstack DB",
                  "Investigate developer pain around staging database seeding, anonymizing production dumps, and schema rollbacks in team environments."
                )
              }
              className="px-2.5 py-1 border border-ink bg-canvas hover:bg-surface text-[11px] text-ink font-bold transition"
            >
              DB Seed & Migration Sync
            </button>
            <button
              type="button"
              onClick={() =>
                fillExample(
                  "Freelance Contractor Compliance",
                  "B2B FinTech / Operations",
                  "Examine small business friction verifying international contractor invoices, tax forms (W-8BEN), and currency exchange markups."
                )
              }
              className="px-2.5 py-1 border border-ink bg-canvas hover:bg-surface text-[11px] text-ink font-bold transition"
            >
              Contractor Tax & Compliance
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="block text-ink text-[10px] uppercase font-bold mb-1">
              Investigation Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Database Migration & Seed Sync"
              className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-ink text-[10px] uppercase font-bold mb-1">
              Target Market or Domain
            </label>
            <input
              type="text"
              required
              value={targetMarketOrDomain}
              onChange={(e) => setTargetMarketOrDomain(e.target.value)}
              placeholder="e.g. Developer Tooling for Small Remote Teams"
              className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-ink text-[10px] uppercase font-bold mb-1">
              Search Brief & Core Investigation Question
            </label>
            <textarea
              required
              rows={3}
              value={searchBrief}
              onChange={(e) => setSearchBrief(e.target.value)}
              placeholder="Describe the workflow friction or operational problem to investigate..."
              className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Budget Ceiling (USD)
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={budgetCeilingUSD}
                onChange={(e) => setBudgetCeilingUSD(Number(e.target.value))}
                className="w-full p-2 border-2 border-ink bg-canvas text-ink font-black"
              />
            </div>

            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Target Time to Revenue
              </label>
              <select
                value={timeToFirstRevenueWeeks}
                onChange={(e) => setTimeToFirstRevenueWeeks(Number(e.target.value))}
                className="w-full p-2 border-2 border-ink bg-canvas text-ink font-bold cursor-pointer"
              >
                <option value={4}>4 Weeks (Rapid Validation)</option>
                <option value={8}>8 Weeks (Standard)</option>
                <option value={12}>12 Weeks (Complex Spec)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-ink flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-ink bg-surface hover:bg-canvas text-ink font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 border-2 border-ink bg-forest hover:bg-forest/90 text-white font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Launching..." : "Dispatch Scout Agents"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
