import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic", // 设置 JSX 编译模式为 Classic
    }),
  ],
});
