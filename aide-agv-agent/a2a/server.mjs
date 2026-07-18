import express from "express";
import { AGENT_CARD_PATH } from "@a2a-js/sdk";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { agentCardHandler, jsonRpcHandler, UserBuilder } from "@a2a-js/sdk/server/express";
import { atlasAgentCard } from "./agent-card.mjs";
import { AtlasAgentExecutor } from "./sdk-executor.mjs";

export function createAtlasApp() {
  const requestHandler = new DefaultRequestHandler(
    atlasAgentCard,
    new InMemoryTaskStore(),
    new AtlasAgentExecutor()
  );
  const app = express();
  app.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,A2A-Version");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (request.method === "OPTIONS") return response.sendStatus(204);
    next();
  });
  app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
  app.use("/a2a/jsonrpc", jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
  app.get("/health", (_request, response) => response.json({ status: "ok", agent: "atlas" }));
  return app;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  createAtlasApp().listen(8043, "127.0.0.1", () => {
    console.log("Atlas A2A v1.0 server listening on http://127.0.0.1:8043");
  });
}
