import assert from "node:assert/strict";
import test from "node:test";

import { createMiraApp } from "../a2a/server.mjs";

test("Mira exposes RN chat from the same independent service", () => {
  const app = createMiraApp({
    atlasClient: {},
    chatRuntime: {
      chatRn: async (input) => ({ agent: "mira", sessionId: input.sessionId, reply: "Chair 1 is stable." }),
      chatPatient: async (input) => ({ agent: "mira", sessionId: input.sessionId, reply: "How can I coordinate?" })
    }
  });
  const rnRoute = app.router.stack.find((layer) => layer.route?.path === "/chat/rn");
  const patientRoute = app.router.stack.find((layer) => layer.route?.path === "/chat/patient");
  assert.equal(rnRoute?.route?.methods?.post, true);
  assert.equal(patientRoute?.route?.methods?.post, true);
});
