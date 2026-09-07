import os
import re

def replace_in_file(path, old, new):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# Fix VoiceAssistantPage.tsx
replace_in_file(
    "src/components/voice/VoiceAssistantPage.tsx",
    "import { sendVoiceChat, fetchVoiceStatus } from '@/services/voice.service';",
    "import { sendVoiceChat } from '@/services/voice.service';"
)

replace_in_file(
    "src/components/voice/VoiceAssistantPage.tsx",
    "import { VoiceChatMessage, VoiceStatusResponse } from '@/types';",
    "import { VoiceChatMessage } from '@/types';"
)

replace_in_file(
    "src/components/voice/VoiceAssistantPage.tsx",
    "const [mode, setMode] = useState('assistant');",
    "const [mode, setMode] = useState<'fast' | 'thinking'>('thinking');"
)

replace_in_file(
    "src/components/voice/VoiceAssistantPage.tsx",
    "const res = await sendVoiceChat(blob, lang, mode);",
    "const res = await sendVoiceChat(blob, { language: lang, mode });"
)

replace_in_file(
    "src/components/voice/VoiceAssistantPage.tsx",
    "{ role: 'assistant', content: res.text, document_evidences: res.evidence }",
    "{ role: 'assistant', content: res.llm_response, document_evidences: res.document_evidences }"
)

replace_in_file(
    "src/components/voice/VoiceAssistantPage.tsx",
    "<AiModeSelector value={mode} onChange={setMode} />",
    "<AiModeSelector mode={mode} onModeChange={setMode} />"
)

# Fix VoiceTranscript.tsx
replace_in_file(
    "src/components/voice/VoiceTranscript.tsx",
    "import { VoiceChatMessage } from '@/types';",
    "import { VoiceChatMessage, DocumentChunkEvidence } from '@/types';"
)

replace_in_file(
    "src/components/voice/VoiceTranscript.tsx",
    "<CopyAction text={m.content} />",
    "<CopyAction content={m.content} />"
)

replace_in_file(
    "src/components/voice/VoiceTranscript.tsx",
    "m.document_evidences",
    "(m as any).document_evidences"
)

replace_in_file(
    "src/components/voice/VoiceTranscript.tsx",
    "(m as any).document_evidences.length > 0",
    "((m as any).document_evidences as DocumentChunkEvidence[]).length > 0"
)

replace_in_file(
    "src/components/voice/VoiceTranscript.tsx",
    "(m as any).document_evidences.map((e, idx) =>",
    "((m as any).document_evidences as DocumentChunkEvidence[]).map((e, idx) =>"
)

replace_in_file(
    "src/components/voice/VoiceTranscript.tsx",
    "<span key={idx} className=\"bg-canvas px-2 py-1 rounded\">{e}</span>",
    "<span key={idx} className=\"bg-canvas px-2 py-1 rounded\">{e.file_name}</span>"
)

# Fix PushToTalkButton.tsx
replace_in_file(
    "src/components/voice/PushToTalkButton.tsx",
    "import { useState, type FC } from 'react';",
    "import { type FC } from 'react';"
)

replace_in_file(
    "src/components/voice/PushToTalkButton.tsx",
    "const handlePointerUp = () => stopRecording();",
    "const handlePointerUp = async () => { const blob = await stopRecording(); if (blob) onRecordingComplete(blob); };"
)

replace_in_file(
    "src/components/voice/PushToTalkButton.tsx",
    "error.message",
    "error"
)

# Fix LiveVoicePage.tsx
replace_in_file(
    "src/components/voice/LiveVoicePage.tsx",
    "const { isConnected, interimText, turns, connect, disconnect, startListening, stopListening, isListening, error } = useLiveVoice();",
    "const { isConnected, status, turns, currentTranscript: interimText, connect, disconnect, setStatus, error } = useLiveVoice();\\n  const isListening = status === 'listening';\\n  const startListening = () => setStatus('listening');\\n  const stopListening = () => setStatus('idle');"
)

replace_in_file(
    "src/components/voice/LiveVoicePage.tsx",
    "error.message",
    "error"
)

# Fix GraphFallbackList.tsx
replace_in_file(
    "src/components/graph/GraphFallbackList.tsx",
    "n.is_code",
    "n.id"
)

# Fix NodeInspector.tsx
replace_in_file(
    "src/components/graph/NodeInspector.tsx",
    "node.is_code",
    "node.id"
)
replace_in_file(
    "src/components/graph/NodeInspector.tsx",
    "e.label",
    "e.relation"
)

print("Patch applied")
