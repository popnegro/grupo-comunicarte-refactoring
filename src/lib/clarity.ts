import Clarity from '@microsoft/clarity';

const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();

let initialized = false;

export function initClarity() {
  if (initialized || !projectId) return;

  Clarity.init(projectId);
  initialized = true;
}

export function trackClarityEvent(eventName: string) {
  if (!initialized || !eventName) return;

  Clarity.event(eventName);
}
