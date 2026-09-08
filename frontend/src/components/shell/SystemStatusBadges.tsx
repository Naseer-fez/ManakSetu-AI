import React, { useEffect, useState } from "react";
import { Cpu, Server, FileCheck } from "lucide-react";
import { useRemembrance } from "@/context/RemembranceContext";
import { fetchMacStatus, type MacStatus } from "@/services/pipeline.service";

export const SystemStatusBadges: React.FC = () => {
  const { file, analysis } = useRemembrance();
  const [macStatus, setMacStatus] = useState<MacStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const s = await fetchMacStatus();
        if (mounted) setMacStatus(s);
      } catch (err: unknown) {
        if (mounted) setMacStatus({ endpoint: "", host: "Mac Cluster", port: 5008, online: false });
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const hasTender = Boolean(file || analysis);

  return (
    <div className="flex items-center gap-2 text-xs">
      {hasTender && (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 font-medium">
          <FileCheck className="w-3.5 h-3.5 text-gov-blue dark:text-blue-400" />
          <span className="truncate max-w-[140px]">{file ? file.name : "Active Tender"}</span>
        </span>
      )}

      <span
        title={macStatus?.online ? "Deep Reasoning Cluster: Active" : "Deep Reasoning Cluster: Standby"}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gov-text-secondary dark:text-gray-300 border border-gray-200 dark:border-slate-700 font-medium"
      >
        <Server className="w-3.5 h-3.5" />
        <span>AI Cluster</span>
        <span
          className={`w-2 h-2 rounded-full ${
            macStatus?.online ? "bg-gov-green animate-pulse" : "bg-amber-500"
          }`}
        />
      </span>

      <span
        title="High-Throughput Hardware Accelerated Engine Active"
        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-medium"
      >
        <Cpu className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400" />
        <span>Hardware Accelerated</span>
      </span>
    </div>
  );
};

export default SystemStatusBadges;
