import { MedplumClient, ClientStorage, MemoryStorage } from "@medplum/core";
import { fhirDefaults } from "./config";

export interface MedplumConfig {
  baseUrl?: string;
}

let clientInstance: MedplumClient | null = null;

/**
 * Returns a configured MedplumClient instance for self-hosted FHIR infrastructure.
 * Accepts an explicit configuration or falls back to fhirDefaults.baseUrl.
 */
export function getMedplumClient(config?: MedplumConfig): MedplumClient {
  if (clientInstance) {
    return clientInstance;
  }

  const baseUrl = config?.baseUrl || fhirDefaults.baseUrl;

  clientInstance = new MedplumClient({
    baseUrl,
    storage: typeof window === "undefined" ? new ClientStorage(new MemoryStorage()) : undefined,
  });

  return clientInstance;
}

export const medplum = getMedplumClient();


