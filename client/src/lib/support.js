import { apiJson } from "./api";
async function createSupportSession(payload) {
  return apiJson("/support/sessions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function sendSupportMessage(sessionId, content) {
  return apiJson(`/support/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content })
  });
}
export {
  createSupportSession,
  sendSupportMessage
};
