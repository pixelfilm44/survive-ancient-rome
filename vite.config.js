import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/survive-ancient-rome/",
  plugins: [react()],
});
