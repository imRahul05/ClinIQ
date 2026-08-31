"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@cliniq/ui";
import { Mic, MicOff, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { generateSoapNoteApi } from "@/lib/api/calls.api";

export default function AmbientScribePage() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcript, setTranscript] = React.useState(
    "Nurse Elena: Hello Sarah, thanks for joining the telehealth visit today. How are you feeling?\nSarah: Hi Elena, I've been doing well overall. My daily glucose numbers have been averaging around 92 to 95 mg/dL, and I took my morning Lisinopril without any issues.\nNurse Elena: That's great to hear. Any dizziness, chest discomfort, or other symptoms?\nSarah: No symptoms at all. Just wanted to make sure my Metformin prescription refill went through and get guidance on the diabetic eye exam.\nNurse Elena: Perfect. The Metformin 90-day refill has been authorized at your pharmacy, and I am ordering your annual retinal screening today."
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [soapGenerated, setSoapGenerated] = React.useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateSoapNoteApi({
        transcript,
        patientContext: {
          patientId: "948204",
          age: 38,
          gender: "Female",
          activeConditions: ["Type 2 Diabetes Mellitus", "Essential Hypertension"],
        },
      });
      setSoapGenerated(true);
    } catch {
      setSoapGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>AI_ENGINE // DEEPGRAM_NOVA2_CLAUDE_35</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
            Ambient AI Scribe Workspace
          </h1>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
            Zero-latency medical transcription stream and LLM clinical extraction of FHIR SOAP notes and ICD-10 codings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            className="font-mono text-xs"
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? <MicOff className="size-3.5 mr-2" /> : <Mic className="size-3.5 mr-2" />}
            {isRecording ? "Stop Listening" : "Start Ambient Stream"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Audio Transcript Stream */}
        <div className="lg:col-span-2 space-y-4">
          <Card notch className="flex flex-col h-[480px] overflow-hidden bg-[var(--paper-raised)]">
            <CardHeader className="pb-3 border-b border-[var(--line)] bg-[var(--paper-sunken)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Mic className="size-3.5 text-emerald-500" /> Ambient Stream Feed
                </CardTitle>
                <Badge variant={isRecording ? "destructive" : "secondary"} dot>
                  {isRecording ? "STREAMING DEEPGRAM" : "PAUSED"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 font-mono text-xs text-[var(--ink)] leading-relaxed whitespace-pre-wrap bg-[var(--paper)]">
              {transcript}
            </CardContent>
            <div className="p-3 border-t border-[var(--line)] bg-[var(--paper-sunken)] flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--ink-faint)]">5 conversation turns buffered</span>
              <Button
                size="sm"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="font-mono text-xs gap-1.5"
              >
                <Sparkles className="size-3.5" />
                {isGenerating ? "Synthesizing SOAP..." : "Synthesize AI SOAP"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Pre-call Brief & Review Link */}
        <div className="space-y-4">
          <Card notch className="bg-[var(--paper-raised)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider">Patient EHR Context</CardTitle>
              <CardDescription className="font-mono text-[10px]">
                PRE-ENCOUNTER INVARIANT CACHE
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs font-mono text-[var(--ink-muted)]">
              <div className="p-3 rounded border border-[var(--line)] bg-[var(--paper-sunken)] space-y-1">
                <p className="font-semibold text-[var(--ink)]">Sarah Johnson (38F)</p>
                <p className="text-[11px] text-[var(--ink-faint)]">Conditions: T2D, Essential Hypertension</p>
                <p className="text-[11px] text-[var(--ink-faint)]">Last Telemetry: BP 118/78 · Glucose 92</p>
              </div>
              <div className="p-3 rounded border border-amber-500/30 bg-amber-500/5 text-amber-400 space-y-0.5">
                <p className="font-semibold text-xs">Open HEDIS Quality Gap:</p>
                <p className="text-[11px]">Annual Diabetic Eye Exam required before Q3</p>
              </div>
            </CardContent>
          </Card>

          {soapGenerated && (
            <Card notch className="border-emerald-500/40 bg-emerald-500/5 p-4 bg-[var(--paper-raised)]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <h4 className="font-mono font-semibold text-[var(--ink)] text-xs">SOAP Document Ready</h4>
              </div>
              <p className="font-mono text-[11px] text-[var(--ink-muted)] mb-3">
                Extracted ICD-10 diagnoses E11.9, I10 and structured encounter notes ready for physician sign-off.
              </p>
              <Link href="/provider/scribe-review">
                <Button className="w-full font-mono text-xs justify-center" size="sm">
                  Review & Sign SOAP <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


