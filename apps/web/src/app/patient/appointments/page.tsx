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
import { Calendar, Clock, CheckCircle2, User, Video, MapPin } from "lucide-react";

interface Slot {
  id: string;
  time: string;
  practitioner: string;
  specialty: string;
  type: "video" | "in-person";
}

const AVAILABLE_SLOTS: Slot[] = [
  { id: "slot-1", time: "Tomorrow at 9:30 AM", practitioner: "Elena Rostova, RN", specialty: "Virtual Care Consultation", type: "video" },
  { id: "slot-2", time: "Tomorrow at 11:00 AM", practitioner: "Elena Rostova, RN", specialty: "Virtual Care Consultation", type: "video" },
  { id: "slot-3", time: "Thursday, Sep 04 at 2:00 PM", practitioner: "Dr. Robert Chen, MD", specialty: "Primary Care Comprehensive", type: "video" },
  { id: "slot-4", time: "Friday, Sep 05 at 10:00 AM", practitioner: "Dr. Robert Chen, MD", specialty: "Diabetic Retinal Eye Exam", type: "in-person" },
];

export default function AppointmentsPage() {
  const [selectedSlot, setSelectedSlot] = React.useState<Slot | null>(null);
  const [isBooked, setIsBooked] = React.useState(false);

  const handleHoldAndConfirm = () => {
    if (!selectedSlot) return;
    setIsBooked(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[var(--line)] pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-muted)] mb-1">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>FHIR_SCHEDULING // $FIND_AND_HOLD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--ink)]">
          Schedule Clinical Visit
        </h1>
        <p className="font-mono text-xs text-[var(--ink-muted)] mt-1">
          Atomic slot reservations against provider calendars using FHIR Appointment / Slot invariants.
        </p>
      </div>

      {isBooked ? (
        <Card notch className="border-emerald-500/40 bg-emerald-500/5 p-8 text-center bg-[var(--paper-raised)]">
          <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-medium text-[var(--ink)]">Appointment Confirmed</h3>
          <p className="font-mono text-xs text-[var(--ink-muted)] mt-1 max-w-md mx-auto">
            Your appointment with <span className="text-[var(--ink)] font-semibold">{selectedSlot?.practitioner}</span> has been confirmed for <span className="text-[var(--ink)] font-semibold">{selectedSlot?.time}</span>.
          </p>
          <div className="pt-6">
            <Button
              variant="outline"
              className="font-mono text-xs"
              onClick={() => {
                setIsBooked(false);
                setSelectedSlot(null);
              }}
            >
              Book Another Visit
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-mono text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Available Clinical Slots
            </h3>
            {AVAILABLE_SLOTS.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <Card
                  key={slot.id}
                  notch
                  onClick={() => setSelectedSlot(slot)}
                  className={`cursor-pointer transition-all bg-[var(--paper-raised)] ${
                    isSelected
                      ? "border-[var(--ink)] bg-[var(--paper-sunken)] shadow-xs"
                      : "hover:border-[var(--line-strong)]"
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--ink)] text-sm">{slot.time}</span>
                        <Badge variant={slot.type === "video" ? "default" : "secondary"}>
                          {slot.type === "video" ? <Video className="size-3 mr-1 inline" /> : <MapPin className="size-3 mr-1 inline" />}
                          {slot.type === "video" ? "Virtual HD" : "In-Clinic"}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-[var(--ink-muted)] flex items-center gap-1.5">
                        <User className="size-3.5 text-[var(--ink-faint)]" /> {slot.practitioner}
                      </p>
                      <p className="font-mono text-[11px] text-[var(--ink-faint)]">{slot.specialty}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className="font-mono text-xs"
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <Card notch className="bg-[var(--paper-raised)]">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Booking Summary</CardTitle>
                <CardDescription className="font-mono text-xs">
                  Review selected clinician slot before confirming atomic hold.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs font-mono">
                {selectedSlot ? (
                  <>
                    <div>
                      <span className="text-[var(--ink-muted)]">Clinician:</span>
                      <p className="font-semibold text-[var(--ink)] text-sm mt-0.5">{selectedSlot.practitioner}</p>
                    </div>
                    <div>
                      <span className="text-[var(--ink-muted)]">Date & Time:</span>
                      <p className="font-semibold text-[var(--ink)] mt-0.5">{selectedSlot.time}</p>
                    </div>
                    <div>
                      <span className="text-[var(--ink-muted)]">Format:</span>
                      <p className="font-semibold text-[var(--ink)] capitalize mt-0.5">{selectedSlot.type} Consultation</p>
                    </div>
                    <div className="pt-3">
                      <Button
                        className="w-full font-mono text-xs"
                        size="sm"
                        onClick={handleHoldAndConfirm}
                      >
                        Confirm Booking ($hold)
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-[var(--ink-faint)] py-4 text-center">
                    Select an available slot on the left to review details and confirm.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}


