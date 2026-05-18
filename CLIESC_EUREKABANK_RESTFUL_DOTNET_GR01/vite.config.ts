import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        entry: "electron/main.ts",
      },
      {
        entry: path.join(__dirname, "electron/preload.ts"),
      },
    ]),
    process.env.NODE_ENV === "test" ? undefined : renderer(),
  ],
});
