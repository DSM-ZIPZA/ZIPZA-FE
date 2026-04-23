import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/geocode": {
        target: "https://naveropenapi.apigw.ntruss.com",
        changeOrigin: true,
        rewrite: path =>
          path.replace(/^\/api\/geocode/, "/map-geocode/v2/geocode"),
        configure: proxy => {
          proxy.on("proxyReq", proxyReq => {
            proxyReq.setHeader(
              "X-NCP-APIGW-API-KEY-ID",
              process.env.NAVER_CLIENT_ID ?? ""
            );
            proxyReq.setHeader(
              "X-NCP-APIGW-API-KEY",
              process.env.NAVER_CLIENT_SECRET ?? ""
            );
          });
        },
      },
    },
  },
});
