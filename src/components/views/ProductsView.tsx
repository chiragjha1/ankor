"use client";

import React, { useState } from "react";
import { ProductSpec } from "@/types";
import {
  Code2,
  FileCode,
  CheckCircle2,
  Lock,
  Check,
} from "lucide-react";

interface ProductsViewProps {
  productSpec?: ProductSpec;
  onAuthorizeDeployment?: () => Promise<void>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  productSpec,
  onAuthorizeDeployment,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    productSpec?.files[0]?.path || ""
  );
  const [isDeploying, setIsDeploying] = useState(false);

  if (!productSpec) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-ink/40 bg-surface/50 text-muted font-mono text-xs">
        No product generated yet. Complete validation gates to activate Stage 10 (Product Construction).
      </div>
    );
  }

  const activeFile =
    productSpec.files.find((f) => f.path === selectedFilePath) || productSpec.files[0];

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await onAuthorizeDeployment?.();
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <Code2 className="w-3.5 h-3.5" /> SANDBOXED CODE CONSTRUCTION
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Product Construction Lab
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            The builder receives a frozen specification, generates tested application files, and verifies quality gates. Public deployment requires explicit founder authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {productSpec.deploymentAuthorized ? (
            <div className="comic-badge px-3 py-1.5 bg-[#DCFCE7] text-ink text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              <span>DEPLOYED & VERIFIED</span>
            </div>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-4 py-2 border-2 border-ink bg-forest hover:bg-forest/90 text-white text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isDeploying ? "Deploying..." : "Authorize Production Deploy"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quality Gates Checklist */}
      <div className="comic-panel p-5 bg-surface">
        <div className="text-xs font-mono uppercase font-black text-ink tracking-wider mb-3">
          Stage 10 Mandatory Quality Gates:
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
          {Object.entries(productSpec.qualityGates).map(([gate, passed]) => (
            <div
              key={gate}
              className={`p-2.5 border-2 border-ink flex items-center gap-2 shadow-[2px_2px_0px_#161716] ${
                passed
                  ? "bg-[#DCFCE7] text-ink"
                  : "bg-[#FEE2E2] text-ink"
              }`}
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] truncate font-black uppercase">
                {gate.replace(/([A-Z])/g, " $1")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main File Explorer & Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: File Tree */}
        <div className="comic-panel p-4 bg-surface space-y-3">
          <div className="text-xs font-mono font-black uppercase tracking-wider text-ink flex items-center justify-between border-b-2 border-ink pb-2">
            <span>Generated File Tree ({productSpec.files.length})</span>
            <span className="comic-caption px-1.5 py-0.2 text-[9px]">Sandboxed</span>
          </div>

          <div className="space-y-1.5">
            {productSpec.files.map((file) => {
              const isSelected = file.path === activeFile?.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left p-2.5 border-2 text-xs font-mono transition flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#FEF08A] border-ink text-ink font-black shadow-[2px_2px_0px_#161716]"
                      : "bg-surface hover:bg-canvas border-transparent hover:border-ink text-ink font-medium"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-ink" />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* Test Logs Summary */}
          <div className="pt-3 border-t-2 border-ink space-y-2 text-xs font-mono">
            <div className="text-[10px] uppercase font-black text-ink tracking-wider flex items-center justify-between">
              <span>Test Runner Output</span>
              <span className="comic-badge px-1.5 py-0.2 bg-[#DCFCE7] text-ink text-[9px]">2/2 Passed</span>
            </div>
            <div className="p-3 border-2 border-ink bg-ink text-surface text-[11px] font-mono space-y-1 shadow-[2px_2px_0px_#161716]">
              {productSpec.buildLogs.map((log, i) => (
                <div key={i} className="leading-snug text-gray-200">
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Code Viewer */}
        <div className="comic-panel lg:col-span-2 p-5 bg-surface space-y-3 flex flex-col shadow-[4px_4px_0px_#161716]">
          <div className="flex items-center justify-between border-b-2 border-ink pb-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <FileCode className="w-4 h-4 text-ink" />
              <span className="font-black text-ink">{activeFile?.path}</span>
              <span className="text-muted text-[11px]">({activeFile?.description})</span>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto p-4 border-2 border-ink bg-canvas text-xs font-mono text-ink leading-relaxed shadow-inner">
            <pre className="whitespace-pre font-mono text-[12px]">{activeFile?.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
