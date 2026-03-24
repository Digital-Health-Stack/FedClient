let socket;

export function connectWebSocket(onMessage) {
  socket = new WebSocket("http://localhost:9090/ws");

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
