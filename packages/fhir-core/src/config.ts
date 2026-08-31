export interface FhirDefaults {
  readonly baseUrl: string;
}

export const fhirDefaults: FhirDefaults = {
  baseUrl: "http://localhost:8103/",
};
