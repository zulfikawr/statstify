import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      middlewareMode: false,
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.SPOTIFY_CLIENT_ID": JSON.stringify(env.SPOTIFY_CLIENT_ID),
      "process.env.SPOTIFY_REDIRECT_URI": JSON.stringify(
        env.SPOTIFY_REDIRECT_URI,
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    preview: {
      port: 3000,
      host: "0.0.0.0",
    },
  };
});
