import express from "express";
import { AtlasA2AClient } from "./atlas-client.mjs";
import { coordinateRoutineEvent } from "./mira-coordinator.mjs";

export function createMiraApp(options = {}) {
  const atlasClient = options.atlasClient ?? new AtlasA2AClient(options.atlasBaseUrl);
  const app = express();
  app.use(express.json({ limit: "32kb" }));
  app.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (request.method === "OPTIONS") return response.sendStatus(204);
    next();
  });
  app.get("/health", (_request, response) => response.json({ status: "ok", agent: "mira" }));
  app.post("/poc/events", async (request, response) => {
    try {
      const result = await coordinateRoutineEvent(request.body, {
        discoverAtlas: () => atlasClient.discover(),
        dispatchAtlas: (task) => atlasClient.dispatch(task)
      });
      response.json(result);
    } catch (error) {
      const status = error.code === "INVALID_MIRA_EVENT" ? 400 : 502;
      response.status(status).json({ code: error.code ?? "MIRA_COORDINATION_FAILED", message: error.message, details: error.details ?? [] });
    }
  });
  return app;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  createMiraApp().listen(8042, "127.0.0.1", () => {
    console.log("Mira simulator-event adapter listening on http://127.0.0.1:8042");
  });
}
