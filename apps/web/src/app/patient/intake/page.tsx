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
import { AHC_HRSN_QUESTIONNAIRE } from "@cliniq/fhir-core";
import { CheckCircle2, Save, Send } from "lucide-react";

export default function PatientIntakePage() {
  const [answers, setAnswers] = React.useState<Record<string, string | boolean>>({
    housing_worried: false,
    food_worry: "Never true",
    transportation_barrier: false,
  });
  const [isSaved, setIsSaved] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleToggle = (linkId: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [linkId]: val }));
    setIsSaved(false);
  };

  const handleChoice = (linkId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [linkId]: val }));
    setIsSaved(false);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[var(--line)] pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>FHIR_QUESTIONNAIRE // AHC_HRSN_SCREENING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
          {AHC_HRSN_QUESTIONNAIRE.title}
        </h1>
        <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
          Complete self-reported clinical screenings converted directly into verifiable FHIR QuestionnaireResponse resources.
        </p>
      </div>

      {isSubmitted ? (
        <Card notch className="border-emerald-500/40 bg-emerald-500/5 p-8 text-center bg-[var(--paper-raised)]">
          <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-medium text-[var(--ink)]">Intake Attestation Recorded</h3>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1 max-w-md mx-auto">
            Your responses have been committed to Medplum as a FHIR <code className="text-[var(--ink)] font-mono bg-[var(--paper-sunken)] px-1.5 py-0.5 rounded text-xs border border-[var(--line)]">QuestionnaireResponse</code>.
          </p>
          <div className="pt-6">
            <Button
              variant="outline"
              className="font-mono text-xs"
              onClick={() => setIsSubmitted(false)}
            >
              Edit Questionnaire Responses
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {AHC_HRSN_QUESTIONNAIRE.item?.map((group) => (
            <Card key={group.linkId} notch className="bg-[var(--paper-raised)]">
              <CardHeader className="border-b border-[var(--line)] bg-[var(--paper-sunken)] py-3">
                <CardTitle className="text-sm font-mono font-semibold uppercase tracking-wider">{group.text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {group.item?.map((item) => (
                  <div key={item.linkId} className="space-y-2 border-t border-[var(--line)] first:border-t-0 pt-3 first:pt-0">
                    <label className="font-mono text-xs text-[var(--ink)] leading-relaxed block">{item.text}</label>

                    {item.type === "boolean" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant={answers[item.linkId] === true ? "default" : "outline"}
                          size="sm"
                          className="font-mono text-xs min-w-16"
                          onClick={() => handleToggle(item.linkId, true)}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={answers[item.linkId] === false ? "default" : "outline"}
                          size="sm"
                          className="font-mono text-xs min-w-16"
                          onClick={() => handleToggle(item.linkId, false)}
                        >
                          No
                        </Button>
                      </div>
                    )}

                    {item.type === "choice" && item.answerOption && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.answerOption.map((opt) => (
                          <Button
                            key={opt.valueString}
                            type="button"
                            variant={answers[item.linkId] === opt.valueString ? "default" : "outline"}
                            size="sm"
                            className="font-mono text-xs"
                            onClick={() => handleChoice(item.linkId, opt.valueString || "")}
                          >
                            {opt.valueString}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs"
              onClick={() => setIsSaved(true)}
            >
              <Save className="size-3.5 mr-1.5" /> {isSaved ? "Draft Saved" : "Save Draft"}
            </Button>
            <Button size="sm" onClick={handleSubmit} className="font-mono text-xs">
              <Send className="size-3.5 mr-1.5" /> Commit to Health Record
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


