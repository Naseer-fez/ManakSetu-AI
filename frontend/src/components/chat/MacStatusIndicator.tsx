import React, { useState, useEffect } from "react";
import { Server, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchMacStatus, type MacStatus } from "@/services/pipeline.service";

export const MacStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<MacStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetchMacStatus();
      setStatus(res);
    } catch (err: unknown) {
      setStatus({ endpoint: "", host: "Cluster", port: 5008, online: false, error: "Standby" });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const isOnline = status?.online ?? false;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-gov-offwhite dark:bg-slate-800 border border-gov-border dark:border-slate-700 text-xs">
      <Server className="w-3.5 h-3.5 text-gov-text-secondary dark:text-gray-400" />
      <span className="text-gov-text dark:text-gray-200 font-medium text-xs hidden sm:inline">
        Reasoning Cluster:
      </span>

      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
          isOnline
            ? "bg-emerald-50 text-gov-green border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
            : "bg-amber-50 text-gov-amber border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400"
        }`}
      >
        {isOnline ? (
          <>
            <CheckCircle2 className="w-3 h-3" /> Online {status?.latency_ms ? `(${status.latency_ms}ms)` : ""}
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3" /> Standby
          </>
        )}
      </span>

      <button
        onClick={checkStatus}
        disabled={checking}
        className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gov-text-secondary dark:text-gray-400 transition-colors disabled:opacity-50"
        title="Check cluster connectivity"
      >
        <Activity className={`w-3 h-3 ${checking ? "animate-spin text-gov-blue" : ""}`} />
      </button>
    </div>
  );
};

export default MacStatusIndicator;
