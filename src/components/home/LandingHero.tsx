"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowRight,
  MessageSquareQuote,
  Star,
  TrendingUp,
  GitPullRequest,
  Flame,
  Terminal,
  GripVertical,
  Briefcase,
  AlertTriangle,
  Compass,
  FileText,
  Search,
} from "lucide-react";

interface LandingHeroProps {
  onStartInvestigation: (customIdea?: string) => void;
}

interface EvidenceNodeData {
  id: string;
  source: string;
  channel: string;
  excerpt: string;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  pinColor: string;
  defaultRel: { x: number; y: number };
  x: number;
  y: number;
}

// 10 Balanced Evidence Sources across Left and Right quadrants
const INITIAL_EVIDENCE_SOURCES: Omit<EvidenceNodeData, "x" | "y">[] = [
  // --- LEFT SIDE NODES ---
  {
    id: "reddit",
    source: "r/SaaS",
    channel: "REDDIT FEED",
    excerpt: "34 founders complaining about Stripe billing sync failures this week",
    metric: "34 posts",
    icon: MessageSquareQuote,
    bg: "#FFF1F2",
    pinColor: "#EF4444",
    defaultRel: { x: 0.03, y: 0.12 },
  },
  {
    id: "producthunt",
    source: "Product Hunt",
    channel: "MAKER FORUM",
    excerpt: "Why are all medical claim verification tools desktop-only legacy software?",
    metric: "88 upvotes",
    icon: Compass,
    bg: "#ECFEFF",
    pinColor: "#06B6D4",
    defaultRel: { x: 0.02, y: 0.42 },
  },
  {
    id: "g2",
    source: "G2 Reviews",
    channel: "REVIEWS",
    excerpt: "1.5-star drop: 'Sync broke again after update, lost 4 client audits'",
    metric: "Drop: -2.4",
    icon: Star,
    bg: "#FEF9C3",
    pinColor: "#EAB308",
    defaultRel: { x: 0.04, y: 0.70 },
  },
  {
    id: "hackernews",
    source: "Hacker News",
    channel: "HN THREAD",
    excerpt: "Ask HN: What manual spreadsheet task steals 10+ hrs every week?",
    metric: "412 replies",
    icon: Flame,
    bg: "#FFEDD5",
    pinColor: "#F97316",
    defaultRel: { x: 0.24, y: 0.04 },
  },
  {
    id: "support",
    source: "Discord Support",
    channel: "TICKETS",
    excerpt: "Clearinghouse rejected insurance CSV format for 3rd time this month",
    metric: "Recurring pain",
    icon: Terminal,
    bg: "#EDE9FE",
    pinColor: "#8B5CF6",
    defaultRel: { x: 0.22, y: 0.82 },
  },

  // --- RIGHT SIDE NODES (Shifted cleanly to the right) ---
  {
    id: "procurement",
    source: "State Procurement",
    channel: "PUBLIC RFP",
    excerpt: "State Health RFP: Legacy EHR claim verification bridge automation",
    metric: "$45k RFP",
    icon: FileText,
    bg: "#F5F3FF",
    pinColor: "#A855F7",
    defaultRel: { x: 0.66, y: 0.04 },
  },
  {
    id: "trends",
    source: "Search Trends",
    channel: "GOOGLE SIGNALS",
    excerpt: "+380% breakout query: 'automated claim verification bridge'",
    metric: "+380% Vol",
    icon: TrendingUp,
    bg: "#DCFCE7",
    pinColor: "#10B981",
    defaultRel: { x: 0.86, y: 0.09 },
  },
  {
    id: "upwork",
    source: "Upwork Contracts",
    channel: "FREELANCE POSTS",
    excerpt: "Need script to export dental claims without crashing EHR ($1,200 fixed)",
    metric: "$1,200 Budget",
    icon: Briefcase,
    bg: "#FEF3C7",
    pinColor: "#F59E0B",
    defaultRel: { x: 0.87, y: 0.38 },
  },
  {
    id: "trustpilot",
    source: "Trustpilot",
    channel: "1-STAR REVIEWS",
    excerpt: "Their sync broke 4 days before payroll. Zero response from support team",
    metric: "1.2/5 Rating",
    icon: AlertTriangle,
    bg: "#FFE4E6",
    pinColor: "#F43F5E",
    defaultRel: { x: 0.86, y: 0.67 },
  },
  {
    id: "github",
    source: "GitHub Issues",
    channel: "REPO TRACKER",
    excerpt: "Issue #1429: clinic export timeout on >500 records (182 comments)",
    metric: "182 comments",
    icon: GitPullRequest,
    bg: "#F1F5F9",
    pinColor: "#64748B",
    defaultRel: { x: 0.68, y: 0.82 },
  },
];

const CARD_WIDTH = 220;
const CARD_HEIGHT = 100;

// Calculate closest perimeter anchor on card
function getCardAnchor(
  cardX: number,
  cardY: number,
  cardW: number,
  cardH: number,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const cx = cardX + cardW / 2;
  const cy = cardY + cardH / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return {
      x: dx > 0 ? cardX + cardW : cardX,
      y: cy,
    };
  } else {
    return {
      x: cx,
      y: dy > 0 ? cardY + cardH : cardY,
    };
  }
}

// Calculate orthogonal 90-degree Manhattan path
function getOrthogonalPath(x1: number, y1: number, x2: number, y2: number): string {
  if (Math.abs(x1 - x2) < 80) {
    const midY = y1 + (y2 - y1) * 0.5;
    return `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
  }
  const midX = x1 + (x2 - x1) * 0.5;
  return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
}

const PRESET_IDEAS = [
  "Dental Insurance Claim Automator",
  "Shopify Dead-Stock Liquidation",
  "Freelancer Invoice Chaser",
  "SOC2 Automated Audit Prep",
];

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartInvestigation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerButtonRef = useRef<HTMLButtonElement>(null);
  const [ideaInput, setIdeaInput] = useState<string>("");

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1400,
    height: 760,
  });

  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number }>({
    x: 700,
    y: 380,
  });

  const [nodes, setNodes] = useState<EvidenceNodeData[]>(() =>
    INITIAL_EVIDENCE_SOURCES.map((s) => ({
      ...s,
      x: s.defaultRel.x * 1400,
      y: s.defaultRel.y * 760,
    }))
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const dragOffsetRef = useRef<{
    pointerX: number;
    pointerY: number;
    origX: number;
    origY: number;
  }>({ pointerX: 0, pointerY: 0, origX: 0, origY: 0 });

  const hasUserDraggedRef = useRef(false);

  // Recalculate target point, container dimensions, and node positions
  const updateLayout = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.width;
    const newHeight = Math.max(740, containerRect.height);

    setDimensions({ width: newWidth, height: newHeight });

    if (centerButtonRef.current) {
      const btnRect = centerButtonRef.current.getBoundingClientRect();
      setTargetPoint({
        x: btnRect.left - containerRect.left + btnRect.width / 2,
        y: btnRect.top - containerRect.top + btnRect.height / 2,
      });
    } else {
      setTargetPoint({
        x: newWidth / 2,
        y: newHeight / 2,
      });
    }

    // If user hasn't manually moved cards yet, align cards to measured container bounds
    if (!hasUserDraggedRef.current) {
      setNodes(
        INITIAL_EVIDENCE_SOURCES.map((s) => ({
          ...s,
          x: Math.max(10, Math.min(newWidth - CARD_WIDTH - 14, s.defaultRel.x * newWidth)),
          y: Math.max(10, Math.min(newHeight - CARD_HEIGHT - 14, s.defaultRel.y * newHeight)),
        }))
      );
    }
  }, []);

  // Update layout on mount and window resize
  useEffect(() => {
    updateLayout();
    const handleResize = () => updateLayout();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateLayout]);

  // Pointer drag events with pointer capture for buttery smooth interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    hasUserDraggedRef.current = true;
    setActiveDragId(id);
    dragOffsetRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      origX: node.x,
      origY: node.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (activeDragId !== id) return;

    const { pointerX, pointerY, origX, origY } = dragOffsetRef.current;
    const dx = e.clientX - pointerX;
    const dy = e.clientY - pointerY;

    const maxX = Math.max(0, dimensions.width - CARD_WIDTH - 10);
    const maxY = Math.max(0, dimensions.height - CARD_HEIGHT - 10);

    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              x: Math.max(10, Math.min(maxX, origX + dx)),
              y: Math.max(10, Math.min(maxY, origY + dy)),
            }
          : n
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDragId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setActiveDragId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[720px] lg:min-h-[780px] relative overflow-hidden select-none flex flex-col items-center justify-center p-4 rounded-sm border-4 border-[#2b2723] shadow-[inset_0_0_80px_rgba(0,0,0,0.9),_6px_6px_0px_#000000] bg-[#181614]"
    >
      {/* Dark Corkboard Granule Texture & Isometric Pinboard Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Natural cork granules pattern */}
          <pattern id="dark-cork-specks" width="64" height="64" patternUnits="userSpaceOnUse">
            <rect width="64" height="64" fill="#181614" />
            <circle cx="8" cy="14" r="1.5" fill="#2d2823" />
            <circle cx="28" cy="8" r="2" fill="#231f1a" />
            <circle cx="44" cy="22" r="1.2" fill="#363029" />
            <circle cx="56" cy="10" r="1.8" fill="#1f1c18" />
            <circle cx="16" cy="40" r="2.2" fill="#2e2924" />
            <circle cx="36" cy="48" r="1.4" fill="#3b342c" />
            <circle cx="52" cy="38" r="2" fill="#26221c" />
            <circle cx="10" cy="58" r="1.2" fill="#322c25" />
            <circle cx="42" cy="60" r="1.8" fill="#2a251f" />
            <circle cx="60" cy="54" r="1.5" fill="#3d362e" />
          </pattern>
          {/* Subtle detective board grid lines */}
          <pattern id="dark-cork-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#36302a" strokeWidth="0.75" strokeDasharray="3 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dark-cork-specks)" />
        <rect width="100%" height="100%" fill="url(#dark-cork-grid)" opacity="0.6" />
      </svg>

      {/* Vignette Shadow Overlay for Moody Noir Ambiance */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(24, 22, 20, 0.2) 0%, rgba(10, 9, 8, 0.85) 100%)",
        }}
      />

      {/* Decorative Brass Corkboard Corner Brackets */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#b4975a] opacity-80 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#b4975a] opacity-80 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#b4975a] opacity-80 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#b4975a] opacity-80 pointer-events-none" />

      {/* SVG Connecting Lines & Animated Yellow Data Packets Layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        width={dimensions.width}
        height={dimensions.height}
      >
        {/* Convergence Hub Node behind/at button */}
        <g transform={`translate(${targetPoint.x}, ${targetPoint.y})`}>
          <circle
            r="44"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-spin opacity-50"
            style={{ animationDuration: "20s" }}
          />
          <circle
            r="26"
            fill="none"
            stroke="#FEF08A"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="animate-spin opacity-70"
            style={{ animationDuration: "10s", animationDirection: "reverse" }}
          />
          <circle r="8" fill="#FEF08A" stroke="#000000" strokeWidth="2" />
        </g>

        {/* Dynamic Orthogonal Connecting Lines and Traveling Yellow Packets */}
        {nodes.map((node, idx) => {
          const anchor = getCardAnchor(
            node.x,
            node.y,
            CARD_WIDTH,
            CARD_HEIGHT,
            targetPoint.x,
            targetPoint.y
          );
          const pathD = getOrthogonalPath(anchor.x, anchor.y, targetPoint.x, targetPoint.y);
          const speed = 2.6 + (idx % 4) * 0.35; // varied travel speeds

          return (
            <g key={`connection-${node.id}`}>
              {/* Vibrant Detective Board String (Yellow Crime-Board Twine) */}
              <path
                d={pathD}
                fill="none"
                stroke="#FEF08A"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeOpacity="0.85"
              />

              {/* Little Yellow Data Packet 1 (Circle) */}
              <circle r="4.5" fill="#FEF08A" stroke="#000000" strokeWidth="1.5">
                <animateMotion
                  path={pathD}
                  dur={`${speed}s`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Little Yellow Data Packet 2 (Rect Packet, offset) */}
              <rect
                width="7"
                height="7"
                rx="1.5"
                x="-3.5"
                y="-3.5"
                fill="#FEF08A"
                stroke="#000000"
                strokeWidth="1.5"
              >
                <animateMotion
                  path={pathD}
                  dur={`${speed}s`}
                  begin={`${speed / 2}s`}
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          );
        })}
      </svg>

      {/* Floating Interactive Brutalist Source Cards */}
      {nodes.map((node) => {
        const Icon = node.icon;
        const isDragging = activeDragId === node.id;

        return (
          <div
            key={node.id}
            onPointerDown={(e) => handlePointerDown(e, node.id)}
            onPointerMove={(e) => handlePointerMove(e, node.id)}
            onPointerUp={handlePointerUp}
            style={{
              transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              backgroundColor: node.bg,
            }}
            className={`absolute top-0 left-0 border-2 border-ink p-2.5 rounded-sm flex flex-col justify-between cursor-grab active:cursor-grabbing transition-shadow ${
              isDragging
                ? "z-30 shadow-[6px_6px_0px_#000000] scale-105"
                : "z-20 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000]"
            } touch-none`}
          >
            {/* Corkboard Pushpin Dot with 3D Bead Highlight */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-ink shadow-[1px_1px_0px_#000000] flex items-center justify-center"
              style={{ backgroundColor: node.pinColor }}
            >
              <div className="w-1 h-1 rounded-full bg-white/70" />
            </div>

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-ink/30 pb-1 mt-0.5">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-ink shrink-0" />
                <span className="font-sans font-black text-[10px] uppercase text-ink tracking-tight">
                  {node.source}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-muted uppercase">
                <GripVertical className="w-3 h-3 text-ink/40" />
                <span>{node.channel}</span>
              </div>
            </div>

            {/* Card Excerpt */}
            <p className="font-mono text-[10px] text-ink leading-tight line-clamp-2 italic font-medium my-1">
              &ldquo;{node.excerpt}&rdquo;
            </p>

            {/* Card Footer */}
            <div className="flex items-center justify-between text-[9px] font-mono border-t border-ink/20 pt-1">
              <span className="font-bold text-ink uppercase tracking-wider">{node.metric}</span>
              <span className="comic-caption px-1 py-0.2 text-[8px] bg-white border border-ink text-ink font-bold">
                SIGNAL
              </span>
            </div>
          </div>
        );
      })}

      {/* Center Hero Focal Point (Clean White Incident Dossier against Dark Cork) */}
      <div className="relative z-20 max-w-xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center text-center space-y-5 bg-[#FAF9F5] border-3 border-ink shadow-[8px_8px_0px_#000000] p-6 sm:p-8 rounded-sm">
        {/* Dossier Header Tag */}
        <div className="comic-caption px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider">
          CASE FILE // AUTONOMOUS EVIDENCE DISCOVERY
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl sm:text-5xl font-black font-sans uppercase tracking-tight text-ink">
          ANKOR
        </h1>

        {/* ONE LINE EXPLANATION */}
        <p className="text-sm sm:text-base font-mono text-ink font-medium leading-relaxed max-w-md">
          We investigate the internet and real user behavior to discover viable business opportunities.
        </p>

        {/* Idea Search & Input Box */}
        <div className="w-full max-w-md space-y-2 text-left">
          <label className="block text-[10px] font-mono font-black uppercase text-ink tracking-wider">
            Target Idea or Problem to Investigate:
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-ink/60 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onStartInvestigation(ideaInput);
                }
              }}
              placeholder="e.g. Dental insurance claim automator, Shopify dead-stock..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-ink text-xs font-mono font-semibold text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#FEF08A] shadow-[2px_2px_0px_#161716]"
            />
          </div>

          {/* Quick Idea Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9px] font-mono font-bold uppercase text-muted">Quick test:</span>
            {PRESET_IDEAS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setIdeaInput(preset)}
                className={`text-[9px] font-mono px-2 py-0.5 border border-ink transition cursor-pointer ${
                  ideaInput === preset
                    ? "bg-[#FEF08A] text-ink font-bold shadow-[1px_1px_0px_#161716]"
                    : "bg-white/80 hover:bg-white text-ink/80 hover:text-ink"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* BUTTON IN THE CENTER */}
        <div className="pt-1 relative w-full flex justify-center">
          <button
            ref={centerButtonRef}
            type="button"
            onClick={() => onStartInvestigation(ideaInput)}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-[#FEF08A] hover:bg-[#FDE047] border-2 border-ink font-sans font-black text-lg sm:text-xl uppercase tracking-wider text-ink shadow-[4px_4px_0px_#161716] hover:shadow-[6px_6px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Start Investigation</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Interactive Board Caption */}
        <div className="text-[10px] font-mono text-muted uppercase tracking-widest pt-1">
          [ DRAG EVIDENCE NODES TO RE-ROUTE LIVE DATA PACKETS ]
        </div>
      </div>
    </div>
  );
};
