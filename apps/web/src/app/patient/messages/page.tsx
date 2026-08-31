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
import { Send, Paperclip, ShieldCheck } from "lucide-react";

interface Message {
  id: string;
  sender: "patient" | "care_team";
  senderName: string;
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "care_team",
    senderName: "Elena Rostova, RN",
    content: "Hello Sarah, I reviewed your latest blood pressure and glucose readings. Your numbers look very steady! Please let me know if you need a refill for your Metformin.",
    timestamp: "Aug 28, 2026 at 2:15 PM",
  },
  {
    id: "msg-2",
    sender: "patient",
    senderName: "Sarah Johnson",
    content: "Hi Nurse Elena, thank you! I did submit a refill request for Metformin. Also, I wanted to ask about scheduling my annual diabetic eye screening.",
    timestamp: "Aug 28, 2026 at 4:30 PM",
  },
  {
    id: "msg-3",
    sender: "care_team",
    senderName: "Elena Rostova, RN",
    content: "That's great. I have approved your 90-day refill at CVS Pharmacy. For the eye screening, you can book an available slot directly through your Appointments tab.",
    timestamp: "Aug 29, 2026 at 9:10 AM",
  },
];

export default function PatientMessagesPage() {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "patient",
      senderName: "Sarah Johnson",
      content: input.trim(),
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[var(--line)] pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>FHIR_COMMUNICATION // THREAD_SJ9482</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
          Secure Care Team Messaging
        </h1>
        <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
          End-to-end encrypted asynchronous channel between patient and assigned clinical coordinators.
        </p>
      </div>

      <Card notch className="flex flex-col h-[540px] overflow-hidden bg-[var(--paper-raised)]">
        {/* Messages Header */}
        <div className="border-b border-[var(--line)] px-6 py-3.5 flex items-center justify-between bg-[var(--paper-sunken)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[var(--line-strong)] bg-[var(--paper-raised)] text-[var(--ink)] flex items-center justify-center font-mono font-bold text-xs">
              ER
            </div>
            <div>
              <p className="font-semibold text-[var(--ink)] text-sm">Elena Rostova, RN</p>
              <p className="font-mono text-[10px] text-[var(--ink-muted)]">Primary Care Coordinator · Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-emerald-500">
            <ShieldCheck className="size-4" /> HIPAA ENCRYPTED
          </div>
        </div>

        {/* Message Bubble List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          {messages.map((msg) => {
            const isMe = msg.sender === "patient";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-md rounded p-3 text-xs ${
                    isMe
                      ? "bg-[var(--ink)] text-[var(--paper)] rounded-br-none font-medium"
                      : "bg-[var(--paper-sunken)] text-[var(--ink)] border border-[var(--line)] rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[10px] text-[var(--ink-faint)] mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="border-t border-[var(--line)] p-3.5 bg-[var(--paper-sunken)] flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-[var(--ink-faint)] hover:text-[var(--ink)]">
            <Paperclip className="size-4" />
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Send an encrypted message to Nurse Elena..."
            className="flex-1 rounded border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-2 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--ink)]"
          />
          <Button size="sm" onClick={handleSend} className="font-mono text-xs">
            <Send className="size-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}


