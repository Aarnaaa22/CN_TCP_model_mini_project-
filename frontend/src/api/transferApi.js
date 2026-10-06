/**
 * transferApi.js
 * Centralized REST API calls to the backend.
 * All URLs are driven by VITE_API_URL env variable or resolve to relative path in production.
 */

const BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

/** Start a transfer simulation.
 * @param {File} file
 * @param {Array}  errorInjections  [{packetNumber, errorType}]
 */
export async function startTransfer(file, errorInjections = []) {
  const form = new FormData();
  form.append('file', file);
  if (errorInjections.length > 0) {
    form.append('errorInjections', JSON.stringify(errorInjections));
  }
  return apiFetch('/api/transfer/start', { method: 'POST', body: form });
}

/** Stop the running simulation. */
export async function stopTransfer() {
  return apiFetch('/api/transfer/stop', { method: 'POST' });
}

/** Reset simulation state. */
export async function resetTransfer() {
  return apiFetch('/api/transfer/reset', { method: 'POST' });
}

/** Get current transfer status + stats. */
export async function getStatus() {
  return apiFetch('/api/transfer/status');
}

/** Get all packets and their states. */
export async function getPackets() {
  return apiFetch('/api/transfer/packets');
}

/** Update simulation config. */
export async function updateConfig(config) {
  return apiFetch('/api/transfer/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
}

/** Manually inject an error for a packet. */
export async function injectError(packetNumber, errorType) {
  return apiFetch('/api/transfer/inject-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packetNumber, errorType }),
  });
}

export { BASE };
