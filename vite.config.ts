import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api/geocode": {
          target: "https://dapi.kakao.com",
          changeOrigin: true,
          rewrite: path =>
            path.replace(/^\/api\/geocode/, "/v2/local/search/keyword.json"),
          configure: proxy => {
            proxy.on("proxyReq", proxyReq => {
              proxyReq.setHeader(
                "Authorization",
                `KakaoAK ${env.VITE_KAKAO_REST_API_KEY}`
              );
            });
          },
        },
      },
    },
  };
});
