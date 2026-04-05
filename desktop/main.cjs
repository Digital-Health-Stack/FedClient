const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");
const net = require("net");
const express = require("express");

/** Free TCP port on loopback (avoids ESM-only get-port with require()). */
function getFreePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, host, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : null;
      server.close(() => {
        if (port == null) {
          reject(new Error("Could not allocate a free port"));
          return;
        }
        resolve(port);
      });
    });
  });
}

const API_PORT =
  Number(process.env.FEDCLIENT_API_PORT) > 0
    ? Number(process.env.FEDCLIENT_API_PORT)
    : 9090;

let mainWindow = null;
let backendProcess = null;
let staticServer = null;
/** Cached UI URL (Vite, static server, or ELECTRON_START_URL) for macOS activate. */
let resolvedAppUrl = null;

function getPythonExecutable() {
  if (process.env.PYTHON) {
    return process.env.PYTHON;
  }
  const cwd = getBackendCwd();
  if (process.platform === "win32") {
    const venvPy = path.join(cwd, "venv", "Scripts", "python.exe");
    if (fs.existsSync(venvPy)) {
      return venvPy;
    }
    return "python";
  }
  const venvPy = path.join(cwd, "venv", "bin", "python");
  if (fs.existsSync(venvPy)) {
    return venvPy;
  }
  return "python3";
}

function getBackendCwd() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend");
  }
  return path.join(__dirname, "..", "backend");
}

function getFrontendDist() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "frontend", "dist");
  }
  return path.join(__dirname, "..", "frontend", "dist");
}

function startBackend() {
  if (process.env.ELECTRON_SKIP_BACKEND === "1") {
    return Promise.resolve();
  }

  const cwd = getBackendCwd();
  const cmd = getPythonExecutable();
  const args = [
    "-m",
    "uvicorn",
    "main:app",
    "--host",
    "127.0.0.1",
    "--port",
    String(API_PORT),
  ];

  return new Promise((resolve, reject) => {
    backendProcess = spawn(cmd, args, {
      cwd,
      env: {
        ...process.env,
        FEDCLIENT_API_PORT: String(API_PORT),
      },
      stdio: "inherit",
    });

    backendProcess.on("error", (err) => {
      reject(
        new Error(
          `Failed to start Python backend (${cmd}). Use backend/venv with uvicorn installed, or set PYTHON: ${err.message}`,
        ),
      );
    });

    backendProcess.on("spawn", () => resolve());

    if (!backendProcess.pid) {
      reject(new Error("Backend process did not start"));
    }
  });
}

function waitForBackendReady(timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;
  const url = `http://127.0.0.1:${API_PORT}/docs`;

  return new Promise((resolve, reject) => {
    const poll = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() > deadline) {
          reject(new Error(`Backend did not become ready at ${url}`));
          return;
        }
        setTimeout(poll, 400);
      });
    };
    poll();
  });
}

function startStaticServer(distDir) {
  return (async () => {
    const port = await getFreePort("127.0.0.1");
    const ex = express();
    ex.use(express.static(distDir));
    ex.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
    await new Promise((resolve, reject) => {
      staticServer = ex.listen(port, "127.0.0.1", resolve);
      staticServer.on("error", reject);
    });
    return `http://127.0.0.1:${port}`;
  })();
}

async function resolveLoadUrl() {
  if (resolvedAppUrl) {
    return resolvedAppUrl;
  }

  const startUrl = process.env.ELECTRON_START_URL;
  if (startUrl) {
    resolvedAppUrl = startUrl;
    return resolvedAppUrl;
  }

  const dist = getFrontendDist();
  if (!fs.existsSync(path.join(dist, "index.html"))) {
    throw new Error(
      `No frontend build at ${dist}. Run: npm run build:frontend (from desktop/)`,
    );
  }

  resolvedAppUrl = await startStaticServer(dist);
  return resolvedAppUrl;
}

function createWindow(loadUrl) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(loadUrl);

  if (process.env.ELECTRON_OPEN_DEVTOOLS === "1") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function shutdownBackend() {
  if (!backendProcess) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(backendProcess.pid), "/f", "/t"]);
    } else {
      backendProcess.kill("SIGTERM");
    }
  } catch (_) {
    /* ignore */
  }
  backendProcess = null;
}

function shutdownStatic() {
  if (staticServer) {
    try {
      staticServer.close();
    } catch (_) {
      /* ignore */
    }
    staticServer = null;
  }
}

app.whenReady().then(async () => {
  process.env.FEDCLIENT_API_PORT = String(API_PORT);

  try {
    await startBackend();
    await waitForBackendReady();
    const loadUrl = await resolveLoadUrl();
    createWindow(loadUrl);
  } catch (err) {
    console.error(err);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      resolveLoadUrl().then(createWindow).catch(console.error);
    }
  });
});

app.on("window-all-closed", () => {
  shutdownStatic();
  shutdownBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  shutdownStatic();
  shutdownBackend();
});
