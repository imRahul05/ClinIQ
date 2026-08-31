import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { logger } from "./logger";

export interface ConnectedClient {
  userId: string;
  role: string;
  organizationId: string;
  providerId?: string;
  patientId?: string;
  ws: WebSocket;
}

const clients = new Map<string, ConnectedClient>();

export function attachWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    let clientId: string | null = null;

    ws.on("message", (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === "auth") {
          clientId = message.userId;
          if (clientId) {
            clients.set(clientId, {
              userId: message.userId,
              role: message.role,
              organizationId: message.organizationId,
              providerId: message.providerId,
              patientId: message.patientId,
              ws,
            });
            logger.info({ userId: message.userId, role: message.role }, "WebSocket client authenticated");
          }
        }
      } catch (err) {
        logger.warn({ err }, "Invalid WebSocket message received");
      }
    });

    ws.on("close", () => {
      if (clientId) {
        clients.delete(clientId);
        logger.info({ clientId }, "WebSocket client disconnected");
      }
    });
  });

  return wss;
}

export type WebSocketPayload = Record<
  string,
  string | number | boolean | null | undefined | string[] | Record<string, string | number | boolean>
>;

export function sendToUser(userId: string, event: string, payload: WebSocketPayload): boolean {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify({ type: event, payload }));
    return true;
  }
  return false;
}

export function broadcastToOrg(orgId: string, event: string, payload: WebSocketPayload): void {
  for (const client of clients.values()) {
    if (client.organizationId === orgId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type: event, payload }));
    }
  }
}

export function getAvailableProviderIds(orgId: string): string[] {
  const ids: string[] = [];
  for (const client of clients.values()) {
    if (client.organizationId === orgId && client.providerId && client.ws.readyState === WebSocket.OPEN) {
      ids.push(client.providerId);
    }
  }
  return ids;
}
