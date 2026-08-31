"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@cliniq/ui";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
  Bot,
  UserCheck,
  Send,
} from "lucide-react";

export default function PatientCareCallPage() {
  const [inCall, setInCall] = React.useState(false);
  const [micMuted, setMicMuted] = React.useState(false);
  const [videoOff, setVideoOff] = React.useState(false);

  // Maya AI chat
  const [mayaMessages, setMayaMessages] = React.useState<Array<{ role: "user" | "maya"; text: string }>>([
    {
      role: "maya",
      text: "Hello Sarah. I am Maya, your clinical intake & invariant assistant. I have evaluated your longitudinal record (fasting glucose 92 mg/dL, Metformin 500mg BID). How can I assist with your visit today?",
    },
  ]);
  const [mayaInput, setMayaInput] = React.useState("");

  const handleMayaSend = () => {
    if (!mayaInput.trim()) return;
    const query = mayaInput.trim();
    setMayaMessages((prev) => [...prev, { role: "user", text: query }]);
    setMayaInput("");

    setTimeout(() => {
      let reply = "Based on your clinical record, your fasting blood glucose is holding stable at 92 mg/dL. All diabetic protocols are satisfied. Let Nurse Elena know if you need any adjustments.";
      if (query.toLowerCase().includes("call") || query.toLowerCase().includes("nurse") || query.toLowerCase().includes("doctor")) {
        reply = "You can initiate a direct WebRTC video consultation with your primary care team above. Nurse Elena is currently on-duty.";
      }
      setMayaMessages((prev) => [...prev, { role: "maya", text: reply }]);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[var(--line)] pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>TELEHEALTH_WEBRTC // REALTIME_AUDIO_VIDEO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
          Care Hub & Virtual Examination
        </h1>
        <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
          End-to-end encrypted WebRTC room with live Maya AI pre-exam triage and clinical record verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Video Consultation Stage */}
        <div className="lg:col-span-2 space-y-4">
          <Card notch className="overflow-hidden bg-[var(--paper-raised)]">
            <CardHeader className="pb-3 border-b border-[var(--line)] bg-[var(--paper-sunken)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Video className="size-4 text-emerald-500" /> Virtual Examination Room
                </CardTitle>
                <Badge variant={inCall ? "success" : "secondary"} dot>
                  {inCall ? "ENCRYPTED HD SESSION" : "ROOM READY"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {inCall ? (
                <div className="relative h-80 bg-[var(--paper-sunken)] flex items-center justify-center">
                  {/* Remote Video Placeholder */}
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-[var(--paper-raised)] border border-[var(--line-strong)] text-[var(--ink)] mx-auto flex items-center justify-center">
                      <UserCheck className="size-8 text-emerald-400" />
                    </div>
                    <p className="font-mono text-sm font-semibold text-[var(--ink)]">Elena Rostova, RN</p>
                    <p className="font-mono text-xs text-emerald-500 animate-pulse">● WebRTC Audio/Video Active · 24ms</p>
                  </div>

                  {/* Self-view PiP */}
                  <div className="absolute bottom-4 right-4 w-28 h-20 rounded border border-[var(--line-strong)] bg-[var(--paper-raised)] flex items-center justify-center font-mono text-[10px] text-[var(--ink-muted)] shadow-md">
                    {videoOff ? "Camera Off" : "Sarah Johnson"}
                  </div>
                </div>
              ) : (
                <div className="h-80 bg-[var(--paper-sunken)] flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="size-14 rounded border border-[var(--line-strong)] bg-[var(--paper-raised)] text-[var(--ink)] flex items-center justify-center">
                    <Video className="size-7 text-[var(--ink)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base text-[var(--ink)]">Ready for your video consultation?</h3>
                    <p className="font-mono text-xs text-[var(--ink-muted)] max-w-sm mt-1">
                      Our smart call routing automatically connects you to your assigned nurse first, backed by verified FHIR telemetry.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="font-mono text-xs"
                    onClick={() => setInCall(true)}
                  >
                    <Video className="size-4 mr-2" /> Start Video Consultation
                  </Button>
                </div>
              )}

              {/* Call Controls Bar */}
              {inCall && (
                <div className="flex items-center justify-center gap-4 py-4 bg-[var(--paper-sunken)] border-t border-[var(--line)]">
                  <Button
                    variant={micMuted ? "destructive" : "secondary"}
                    size="icon"
                    onClick={() => setMicMuted(!micMuted)}
                  >
                    {micMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                  </Button>
                  <Button
                    variant={videoOff ? "destructive" : "secondary"}
                    size="icon"
                    onClick={() => setVideoOff(!videoOff)}
                  >
                    {videoOff ? <VideoOff className="size-4" /> : <Video className="size-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    className="px-6 font-mono text-xs"
                    onClick={() => setInCall(false)}
                  >
                    <PhoneOff className="size-4 mr-2" /> End Call
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Maya AI Health Assistant */}
        <div className="space-y-4">
          <Card notch className="flex flex-col h-[460px] bg-[var(--paper-raised)]">
            <CardHeader className="pb-3 border-b border-[var(--line)] bg-[var(--paper-sunken)]">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]">
                  <Sparkles className="size-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Maya Intake Agent</CardTitle>
                  <CardDescription className="font-mono text-[10px]">
                    CLINICAL RAG // FHIR R4
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {mayaMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "maya" && (
                    <div className="size-6 rounded border border-[var(--line-strong)] bg-[var(--paper-sunken)] text-[var(--ink)] flex items-center justify-center text-xs shrink-0 mt-1">
                      <Bot className="size-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded p-2.5 font-mono text-xs ${
                      m.role === "user"
                        ? "bg-[var(--ink)] text-[var(--paper)] rounded-br-none"
                        : "bg-[var(--paper-sunken)] text-[var(--ink)] border border-[var(--line)] rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </CardContent>

            <div className="border-t border-[var(--line)] p-3 bg-[var(--paper-sunken)] flex items-center gap-2">
              <input
                type="text"
                value={mayaInput}
                onChange={(e) => setMayaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMayaSend()}
                placeholder="Ask Maya about vitals or symptoms..."
                className="flex-1 rounded border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--ink)]"
              />
              <Button size="sm" onClick={handleMayaSend} className="font-mono">
                <Send className="size-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


