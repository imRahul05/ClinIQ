export interface LoincConcept {
  code: string;
  display: string;
  unit: string;
  category: "vital-signs" | "laboratory" | "survey";
  normalRange?: {
    low: number;
    high: number;
  };
}

export const LOINC_CODES = {
  // Vital Signs
  BLOOD_PRESSURE_SYSTOLIC: "8480-6",
  BLOOD_PRESSURE_DIASTOLIC: "8462-4",
  HEART_RATE: "8867-4",
  BODY_WEIGHT: "29463-7",
  BODY_HEIGHT: "8302-2",
  BODY_TEMPERATURE: "8310-5",
  OXYGEN_SATURATION: "2708-6",
  RESPIRATORY_RATE: "9279-1",
  BMI: "39156-5",
  
  // Laboratory Tests
  GLUCOSE_SERUM: "2339-0",
  HBA1C: "4548-4",
  TOTAL_CHOLESTEROL: "2093-3",
  HDL_CHOLESTEROL: "2085-9",
  LDL_CHOLESTEROL: "2089-1",
  TRIGLYCERIDES: "2571-8",
  CREATININE: "2160-0",
  EGFR: "33914-3",
  TSH: "3016-3",
} as const;

export const LOINC_DEFINITIONS: Record<string, LoincConcept> = {
  [LOINC_CODES.BLOOD_PRESSURE_SYSTOLIC]: {
    code: LOINC_CODES.BLOOD_PRESSURE_SYSTOLIC,
    display: "Systolic Blood Pressure",
    unit: "mmHg",
    category: "vital-signs",
    normalRange: { low: 90, high: 120 },
  },
  [LOINC_CODES.BLOOD_PRESSURE_DIASTOLIC]: {
    code: LOINC_CODES.BLOOD_PRESSURE_DIASTOLIC,
    display: "Diastolic Blood Pressure",
    unit: "mmHg",
    category: "vital-signs",
    normalRange: { low: 60, high: 80 },
  },
  [LOINC_CODES.HEART_RATE]: {
    code: LOINC_CODES.HEART_RATE,
    display: "Heart Rate",
    unit: "bpm",
    category: "vital-signs",
    normalRange: { low: 60, high: 100 },
  },
  [LOINC_CODES.BODY_WEIGHT]: {
    code: LOINC_CODES.BODY_WEIGHT,
    display: "Body Weight",
    unit: "lbs",
    category: "vital-signs",
  },
  [LOINC_CODES.GLUCOSE_SERUM]: {
    code: LOINC_CODES.GLUCOSE_SERUM,
    display: "Fasting Blood Glucose",
    unit: "mg/dL",
    category: "laboratory",
    normalRange: { low: 70, high: 99 },
  },
  [LOINC_CODES.HBA1C]: {
    code: LOINC_CODES.HBA1C,
    display: "Hemoglobin A1c",
    unit: "%",
    category: "laboratory",
    normalRange: { low: 4.0, high: 5.6 },
  },
  [LOINC_CODES.TOTAL_CHOLESTEROL]: {
    code: LOINC_CODES.TOTAL_CHOLESTEROL,
    display: "Total Cholesterol",
    unit: "mg/dL",
    category: "laboratory",
    normalRange: { low: 125, high: 200 },
  },
};
