import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import jwt from "jsonwebtoken";
import type { UserClaims } from "@cliniq/api-spec";
import { config } from "../config";
import { verifyMedplumToken } from "../middleware/auth";
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

  wss.on("connection", (ws: WebSocket) => {
    let clientId: string | null = null;

    ws.on("message", async (raw) => {
      try {
        const message = JSON.parse(raw.toString());

        if (message.type === "auth") {
          const token = message.token;

          if (!token || typeof token !== "string") {
            logger.warn("WebSocket authentication rejected: Token missing or invalid format");
            ws.send(JSON.stringify({ type: "auth_error", error: "Token is required for authentication" }));
            ws.close(4401, "Unauthorized: Token missing");
            return;
          }

          let verifiedUser: UserClaims | null = null;

          // 1. Attempt internal HS256 JWT verification
          try {
            const decoded = jwt.verify(token, config.jwt.secret) as UserClaims;
            if (decoded && decoded.userId && decoded.role) {
              verifiedUser = decoded;
            }
          } catch {
            // Token is not signed by internal secret; check Medplum JWKS
          }

          // 2. Attempt Medplum verification if internal secret failed
          if (!verifiedUser) {
            try {
              verifiedUser = await verifyMedplumToken(token);
            } catch {
              // Medplum verification failed
            }
          }

          if (!verifiedUser) {
            logger.warn("WebSocket authentication rejected: Cryptographic verification failed");
            ws.send(JSON.stringify({ type: "auth_error", error: "Invalid or expired token" }));
            ws.close(4401, "Unauthorized: Invalid token");
            return;
          }

          clientId = verifiedUser.userId;
          clients.set(clientId, {
            userId: verifiedUser.userId,
            role: verifiedUser.role,
            organizationId: verifiedUser.organizationId,
            providerId: verifiedUser.providerId,
            patientId: verifiedUser.patientId,
            ws,
          });

          logger.info(
            { userId: verifiedUser.userId, role: verifiedUser.role, organizationId: verifiedUser.organizationId },
            "WebSocket client successfully authenticated with cryptographic token"
          );

          ws.send(
            JSON.stringify({
              type: "auth_success",
              payload: {
                userId: verifiedUser.userId,
                role: verifiedUser.role,
                organizationId: verifiedUser.organizationId,
              },
            })
          );
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
