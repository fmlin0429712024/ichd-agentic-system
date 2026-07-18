import { readFile } from "node:fs/promises";

export const atlasAgentCard = JSON.parse(
  await readFile(new URL("../contracts/agent-card.json", import.meta.url), "utf8")
);
