import { getMedplumClient } from "@cliniq/fhir-core";
import { clientConfig } from "../config";

export const medplum = getMedplumClient({
  baseUrl: clientConfig.medplumBaseUrl,
});

