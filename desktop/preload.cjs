const { contextBridge } = require("electron");

const API_PORT = Number(process.env.FEDCLIENT_API_PORT) || 9090;
const apiBaseUrl = `http://127.0.0.1:${API_PORT}`;

contextBridge.exposeInMainWorld("electronAPI", {
  apiBaseUrl,
  getApiBaseUrl: () => apiBaseUrl,
  /** ws:// host:port for notification WebSocket (matches API port) */
  wsUrl: () => {
    const u = new URL(apiBaseUrl);
    const protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${u.host}`;
  },
});
