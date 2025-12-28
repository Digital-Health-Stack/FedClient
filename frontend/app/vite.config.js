import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const processEnv = {};
  // Load only environment variables that start with REACT_APP_
  Object.keys(env).forEach((key) => {
    if (key.startsWith('REACT_APP_')) {
      processEnv[key] = env[key];
    }
  });

  return {
    define: {
      "process.env": processEnv,
    },
    plugins: [react()],
    server: {
      host: "0.0.0.0", // Allows external access from Docker
      port: 5174, // Change to the new port
      allowedHosts: ["fedclient.abdm.gov.in"]
    },
  };
});
