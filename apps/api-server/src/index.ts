import { createServer } from "node:http";
import app from "./app";
import { config } from "./config";
import { logger } from "./lib/logger";
import { attachWebSocket } from "./lib/ws";

const server = createServer(app);
attachWebSocket(server);

server.listen(config.port, () => {
  logger.info({ port: config.port }, "ClinIQ API & WebSocket Server listening");
});

