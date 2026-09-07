import os

files = {
    "src/components/voice/NoiseHelper.ts": """export function noise2D(x: number, y: number): number {
  return Math.sin(x) * Math.cos(y);
}
""",
    "src/components/voice/AgentSphere.tsx": """import { useRef, useEffect, type FC } from 'react';
import { noise2D } from '@/components/voice/NoiseHelper';

interface Props {
  amplitude: number;
  isActive: boolean;
}

export const AgentSphere: FC<Props> = ({ amplitude, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50 + amplitude * 20, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 100, 100, 0.8)';
      ctx.fill();
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frame);
  }, [amplitude, isActive]);

  return <canvas ref={canvasRef} width={200} height={200} className="rounded-full" />;
};
""",
    "src/components/voice/PushToTalkButton.tsx": """import { useState, type FC } from 'react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

export const PushToTalkButton: FC<Props> = ({ onRecordingComplete, isProcessing }) => {
  const { isRecording, startRecording, stopRecording, audioBlob, error } = useAudioRecorder();

  const handlePointerDown = () => startRecording();
  const handlePointerUp = () => stopRecording();

  return (
    <div className="flex flex-col items-center">
      <MotionButton
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={isProcessing}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-colors",
          isRecording ? "bg-ruby-glow text-ruby border-ruby" : "bg-surface border-border",
          isProcessing && "opacity-50"
        )}
        aria-label="Push to talk"
      >
        <Mic className={isRecording ? "w-10 h-10 animate-pulse" : "w-10 h-10"} />
      </MotionButton>
      {error && <span className="text-status-danger text-sm mt-2">{error.message}</span>}
    </div>
  );
};
""",
    "src/components/voice/VoiceTranscript.tsx": """import { type FC } from 'react';
import { VoiceChatMessage } from '@/types';
import { CopyAction } from '@/components/primitives/CopyAction';

interface Props {
  messages: VoiceChatMessage[];
}

export const VoiceTranscript: FC<Props> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4 flex-1">
      {messages.map((m, i) => (
        <div key={i} className={`flex flex-col max-w-[80%] ${m.role === 'user' ? 'self-end bg-panel border-border-highlight' : 'self-start bg-surface border-border'} border rounded-xl p-3`}>
          <div className="flex justify-between items-start gap-4">
            <span className="text-text-primary whitespace-pre-wrap">{m.content}</span>
            {m.role === 'assistant' && <CopyAction text={m.content} />}
          </div>
          {m.document_evidences && m.document_evidences.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
              {m.document_evidences.map((e, idx) => (
                <span key={idx} className="bg-canvas px-2 py-1 rounded">{e}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
""",
    "src/components/voice/LanguageSelector.tsx": """import { type FC } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export const LanguageSelector: FC<Props> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-surface border border-border text-text-primary rounded-md px-2 py-1 text-sm"
    >
      <option value="auto">Auto</option>
      <option value="en">English</option>
      <option value="hi">हिन्दी (Hindi)</option>
    </select>
  );
};
""",
    "src/components/voice/VoiceAssistantPage.tsx": """import { useState, type FC } from 'react';
import { AgentSphere } from '@/components/voice/AgentSphere';
import { PushToTalkButton } from '@/components/voice/PushToTalkButton';
import { VoiceTranscript } from '@/components/voice/VoiceTranscript';
import { LanguageSelector } from '@/components/voice/LanguageSelector';
import { AiModeSelector } from '@/components/primitives/AiModeSelector';
import { VoiceChatMessage, VoiceStatusResponse } from '@/types';
import { sendVoiceChat, fetchVoiceStatus } from '@/services/voice.service';

export const VoiceAssistantPage: FC = () => {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [mode, setMode] = useState('assistant');
  const [lang, setLang] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecording = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const res = await sendVoiceChat(blob, lang, mode);
      if (res) {
        setMessages(prev => [...prev, { role: 'user', content: 'Audio sent' }, { role: 'assistant', content: res.text, document_evidences: res.evidence }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <AiModeSelector value={mode} onChange={setMode} />
        <LanguageSelector value={lang} onChange={setLang} />
        <button onClick={() => setMessages([])} className="text-text-muted text-sm hover:text-text-primary">Clear</button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <VoiceTranscript messages={messages} />
        <div className="p-4 flex flex-col items-center gap-6 bg-surface border-t border-border">
          <AgentSphere amplitude={isProcessing ? 0.8 : 0} isActive={isProcessing} />
          <PushToTalkButton onRecordingComplete={handleRecording} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
};
""",
    "src/components/voice/AmplitudeVisualizer.tsx": """import { type FC } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  amplitude: number;
  state: 'idle' | 'listening' | 'processing';
}

export const AmplitudeVisualizer: FC<Props> = ({ amplitude, state }) => {
  const bars = Array.from({ length: 12 });
  
  return (
    <div className="flex items-center gap-1 h-12">
      {bars.map((_, i) => {
        const height = state === 'idle' ? 4 : 4 + Math.random() * amplitude * 40;
        return (
          <div
            key={i}
            className={cn(
              "w-2 rounded-full transition-all duration-75",
              state === 'idle' ? "bg-border" : state === 'listening' ? "bg-status-compliant-bg" : "bg-ruby"
            )}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};
""",
    "src/components/voice/LiveTranscriptStream.tsx": """import { type FC, useRef, useEffect } from 'react';
import { LiveVoiceTurn } from '@/types';

interface Props {
  interim: string;
  turns: LiveVoiceTurn[];
}

export const LiveTranscriptStream: FC<Props> = ({ interim, turns }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interim, turns]);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {turns.map((t, i) => (
        <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
          <div className={`p-3 rounded-xl max-w-[80%] ${t.role === 'user' ? 'bg-panel border border-border' : 'bg-surface border border-border-highlight'}`}>
            <span className="text-text-primary">{t.text}</span>
          </div>
          <span className="text-xs text-text-muted mt-1">{new Date(t.timestamp).toLocaleTimeString()}</span>
        </div>
      ))}
      {interim && (
        <div className="self-end bg-panel border border-border border-dashed p-3 rounded-xl max-w-[80%] opacity-70">
          <span className="text-text-muted italic">{interim}</span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
""",
    "src/components/voice/LiveVoicePage.tsx": """import { type FC } from 'react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { AmplitudeVisualizer } from '@/components/voice/AmplitudeVisualizer';
import { LiveTranscriptStream } from '@/components/voice/LiveTranscriptStream';
import { useLiveVoice } from '@/hooks/useLiveVoice';

export const LiveVoicePage: FC = () => {
  const { isConnected, interimText, turns, connect, disconnect, startListening, stopListening, isListening, error } = useLiveVoice();

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-status-compliant-bg' : 'bg-status-danger-bg'}`} />
          <span className="text-text-primary text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex gap-2">
          {!isConnected ? (
            <MotionButton onClick={connect} className="bg-panel border border-border text-text-primary px-4 py-2 rounded-md">Connect</MotionButton>
          ) : (
            <MotionButton onClick={disconnect} className="bg-ruby-subtle border border-ruby text-ruby px-4 py-2 rounded-md">Disconnect</MotionButton>
          )}
        </div>
      </div>
      
      <LiveTranscriptStream interim={interimText} turns={turns} />
      
      {error && <div className="p-2 text-status-danger text-sm bg-status-danger-bg mx-4 rounded">{error.message}</div>}
      
      <div className="p-4 bg-surface border-t border-border flex flex-col items-center gap-4">
        <AmplitudeVisualizer amplitude={isListening ? 0.8 : 0} state={isConnected ? (isListening ? 'listening' : 'idle') : 'idle'} />
        <MotionButton
          onClick={isListening ? stopListening : startListening}
          disabled={!isConnected}
          className="bg-panel border border-border text-text-primary px-6 py-2 rounded-full"
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </MotionButton>
      </div>
    </div>
  );
};
""",
    "src/components/graph/ForceGraph.tsx": """import { useRef, useEffect, type FC } from 'react';
import { GraphData, GraphNode } from '@/types';

interface Props {
  data: GraphData | null;
  onSelectNode: (node: GraphNode) => void;
}

export const ForceGraph: FC<Props> = ({ data, onSelectNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      data.edges.forEach(edge => {
        const source = data.nodes.find(n => n.id === edge.source);
        const target = data.nodes.find(n => n.id === edge.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, canvas.height / 2); // simplified, real forces omitted for brevity
          ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2 + 50);
          ctx.strokeStyle = '#333';
          ctx.stroke();
        }
      });
      
      data.nodes.forEach((node, i) => {
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + i * 20, canvas.height / 2, 10, 0, Math.PI * 2);
        ctx.fillStyle = node.is_mandatory ? '#f00' : '#00f';
        ctx.fill();
      });

      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const handleClick = () => {
      if (data.nodes.length > 0) onSelectNode(data.nodes[0]);
    };
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('click', handleClick);
    };
  }, [data, onSelectNode]);

  return <canvas ref={canvasRef} className="w-full h-full bg-canvas cursor-pointer" />;
};
""",
    "src/components/graph/GraphControls.tsx": """import { type FC } from 'react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Props {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const GraphControls: FC<Props> = ({ zoom, onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute bottom-4 right-4 flex gap-2 bg-surface p-2 rounded-xl border border-border shadow-lg">
      <MotionButton onClick={onZoomOut} className="p-2 rounded hover:bg-panel text-text-primary">
        <ZoomOut size={20} />
      </MotionButton>
      <div className="flex items-center px-2 text-text-muted text-sm font-mono">
        {Math.round(zoom * 100)}%
      </div>
      <MotionButton onClick={onZoomIn} className="p-2 rounded hover:bg-panel text-text-primary">
        <ZoomIn size={20} />
      </MotionButton>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <MotionButton onClick={onReset} className="p-2 rounded hover:bg-panel text-text-primary">
        <Maximize size={20} />
      </MotionButton>
    </div>
  );
};
""",
    "src/components/graph/NodeInspector.tsx": """import { type FC } from 'react';
import { GraphNode, GraphEdge } from '@/types';
import { StatusToken } from '@/components/primitives/StatusToken';
import { X } from 'lucide-react';

interface Props {
  node: GraphNode;
  edges: GraphEdge[];
  onClose: () => void;
}

export const NodeInspector: FC<Props> = ({ node, edges, onClose }) => {
  return (
    <div className="absolute top-4 right-4 w-80 bg-surface border border-border rounded-xl shadow-xl flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-start p-4 border-b border-border">
        <div>
          <h3 className="text-text-primary font-medium">{node.is_code}</h3>
          <p className="text-sm text-text-muted mt-1">{node.label}</p>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X size={20} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
        <div>
          <div className="text-xs text-text-muted mb-1">Status</div>
          <StatusToken status={node.is_mandatory ? 'COMPLIANT' : 'NEEDS_VERIFICATION'} />
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">Division</div>
          <div className="text-sm text-text-primary">{node.division}</div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-2">Connections</div>
          <div className="flex flex-col gap-2">
            {edges.filter(e => e.source === node.id || e.target === node.id).map((e, i) => (
              <div key={i} className="text-xs bg-panel p-2 rounded border border-border-subtle text-text-secondary">
                {e.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
""",
    "src/components/graph/RadialGraphIntro.tsx": """import { type FC } from 'react';
import { motion } from 'framer-motion';

export const RadialGraphIntro: FC = () => {
  const nodes = ['Standards', 'QCOs', 'Labs', 'Products', 'Safety', 'Tests'];
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas z-10">
      {nodes.map((label, i) => {
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = 100;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: 1, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="absolute p-3 rounded-full bg-surface border border-border text-sm text-text-primary shadow-lg"
          >
            {label}
          </motion.div>
        );
      })}
    </div>
  );
};
""",
    "src/components/graph/GraphFallbackList.tsx": """import { useState, type FC } from 'react';
import { GraphData } from '@/types';

interface Props {
  data: GraphData | null;
}

export const GraphFallbackList: FC<Props> = ({ data }) => {
  const [search, setSearch] = useState('');

  if (!data) return <div className="p-4 text-text-muted">No data available</div>;

  const filtered = data.nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()) || n.is_code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-canvas p-4">
      <input
        type="text"
        placeholder="Search nodes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 bg-surface border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-ruby"
      />
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {filtered.map(n => (
          <div key={n.id} className="bg-panel p-4 rounded-xl border border-border">
            <h4 className="text-text-primary font-medium">{n.is_code}</h4>
            <p className="text-sm text-text-muted">{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
""",
    "src/components/graph/KnowledgeGraphPage.tsx": """import { useState, useEffect, type FC } from 'react';
import { ForceGraph } from '@/components/graph/ForceGraph';
import { GraphControls } from '@/components/graph/GraphControls';
import { NodeInspector } from '@/components/graph/NodeInspector';
import { RadialGraphIntro } from '@/components/graph/RadialGraphIntro';
import { GraphFallbackList } from '@/components/graph/GraphFallbackList';
import { GraphData, GraphNode } from '@/types';
import { fetchKnowledgeGraph } from '@/services/qco.service';

export const KnowledgeGraphPage: FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchKnowledgeGraph().then(res => {
      setData(res);
      setTimeout(() => setIsLoading(false), 1500); // allow intro animation to play
    }).catch(console.error);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-canvas overflow-hidden">
      <div className="absolute top-4 left-4 z-20 flex gap-2 bg-surface p-1 rounded-lg border border-border">
        <button
          onClick={() => setViewMode('graph')}
          className={`px-3 py-1 rounded-md text-sm ${viewMode === 'graph' ? 'bg-panel text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
        >
          Graph
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1 rounded-md text-sm ${viewMode === 'list' ? 'bg-panel text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
        >
          List
        </button>
      </div>

      {isLoading && viewMode === 'graph' && <RadialGraphIntro />}

      {viewMode === 'graph' ? (
        <>
          <div className="flex-1 relative">
            <ForceGraph data={data} onSelectNode={setSelectedNode} />
          </div>
          <GraphControls
            zoom={zoom}
            onZoomIn={() => setZoom(z => Math.min(2, z + 0.2))}
            onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.2))}
            onReset={() => setZoom(1)}
          />
          {selectedNode && data && (
            <NodeInspector node={selectedNode} edges={data.edges} onClose={() => setSelectedNode(null)} />
          )}
        </>
      ) : (
        <GraphFallbackList data={data} />
      )}
    </div>
  );
};
"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files created successfully.")
