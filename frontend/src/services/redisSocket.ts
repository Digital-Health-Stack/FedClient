let socket;

function notificationWsUrl(): string {
  if (window.electronAPI?.wsUrl) {
    return `${window.electronAPI.wsUrl()}/ws`;
  }
  return "ws://127.0.0.1:9090/ws";
}

export function connectWebSocket(onMessage) {
  socket = new WebSocket(notificationWsUrl());

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = event.data;
    if (data.startsWith("New session created with session id:")) {
      const id = data.split("id: ")[1];
      onMessage("New session arrived", id);
    }
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  socket.onclose = () => {
    console.warn("WebSocket closed. Attempting reconnect...");
    // Optional: reconnect logic
  };
}

export function closeWebSocket() {
  if (socket) socket.close();
}
