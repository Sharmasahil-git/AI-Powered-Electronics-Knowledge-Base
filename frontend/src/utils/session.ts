export function getSessionId(): string {
  if (typeof window === "undefined") {
    return "anonymous"; // SSR fallback
  }
  
  let sessionId = localStorage.getItem("guest_session_id");
  if (!sessionId) {
    // Generate a random UUID-like string for anonymous sessions
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    localStorage.setItem("guest_session_id", sessionId);
  }
  return sessionId;
}
