import React, { useState, useEffect } from "react";
import { Server, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchMacStatus, type MacStatus } from "../../services/pipeline.service";

export const MacStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<MacStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetchMacStatus();
      setStatus(res);
    } catch {
      setStatus({ endpoint: "http://10.118.237.94:5008/reason", host: "10.118.237.94", port: 5008, online: false, error: "Network Timeout" });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { checkStatus(); }, []);

  const isOnline = status?.online ?? false;
  const hostDisplay = status ? `${status.host}:${status.port}` : "10.118.237.94:5008";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs">
      <Server className="w-3.5 h-3.5 text-white/50" />
      <span className="text-white/60 font-mono text-[11px] hidden sm:inline">Mac Node: {hostDisplay}</span>

      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        isOnline ? "bg-apple-mint/20 text-apple-mint" : "bg-apple-amber/20 text-apple-amber"
      }`}>
        {isOnline ? (
          <><CheckCircle2 className="w-2.5 h-2.5" /> Online {status?.latency_ms ? `(${status.latency_ms}ms)` : ""}</>
        ) : (
          <><AlertCircle className="w-2.5 h-2.5" /> Local Fallback</>
        )}
      </span>

      <button
        onClick={checkStatus}
        disabled={checking}
        className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors disabled:opacity-50"
        title="Ping Mac reasoning node (10.118.237.94:5008)"
      >
        <Activity className={`w-3 h-3 ${checking ? "animate-spin text-apple-blue" : ""}`} />
      </button>
    </div>
  );
};
