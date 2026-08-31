import type {
  Observation,
  Patient,
  Practitioner,
  HumanName,
} from "@medplum/fhirtypes";

export interface FormattedVital {
  id: string;
  code: string;
  display: string;
  value: number;
  unit: string;
  date: string;
  status: string;
}

export function formatFhirHumanName(name?: HumanName | HumanName[]): string {
  if (!name) return "Unknown";
  const primary = Array.isArray(name) ? name[0] : name;
  if (!primary) return "Unknown";

  if (primary.text) return primary.text;
  const given = primary.given?.join(" ") || "";
  const family = primary.family || "";
  const combined = `${given} ${family}`.trim();
  return combined || "Unknown";
}

export function extractVitalFromObservation(obs: Observation): FormattedVital | null {
  if (!obs.id || !obs.code?.coding?.[0]) return null;

  const coding = obs.code.coding[0];
  const code = coding.code || "unknown";
  const display = coding.display || obs.code.text || "Vital Sign";

  let value = 0;
  let unit = "";

  if (obs.valueQuantity?.value !== undefined) {
    value = obs.valueQuantity.value;
    unit = obs.valueQuantity.unit || "";
  } else if (
    obs.component &&
    obs.component.length > 0 &&
    obs.component[0]?.valueQuantity?.value !== undefined
  ) {
    value = obs.component[0].valueQuantity.value;
    unit = obs.component[0].valueQuantity.unit || "";
  } else {
    return null;
  }

  const date = obs.effectiveDateTime || obs.issued || new Date().toISOString();

  return {
    id: obs.id,
    code,
    display,
    value,
    unit,
    date,
    status: obs.status || "final",
  };
}

export function createPatientDisplayName(patient: Patient): string {
  return formatFhirHumanName(patient.name);
}

export function createPractitionerDisplayName(practitioner: Practitioner): string {
  const prefix = practitioner.name?.[0]?.prefix?.join(" ") || "Dr.";
  return `${prefix} ${formatFhirHumanName(practitioner.name)}`.trim();
}
