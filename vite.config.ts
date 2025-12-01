import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the server to the container
    port: 5173,
    // This allows the CodeSandbox domain to access the server
    allowedHosts: true,

    // --- STABILITY FIXES ---
    // 1. Force Polling: This prevents the connection from dropping when CPU spikes
    watch: {
      usePolling: true,
      interval: 100,
    },
    // 2. HMR Settings: Prevents the overlay from blocking your view and fixes SSL connection issues
    hmr: {
      overlay: false,
      clientPort: 443, // Forces the client to connect via standard HTTPS port
    },
  },
});
