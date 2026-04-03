import { defineConfig } from "vite"
import path from "path"
import react from "@vitejs/plugin-react-swc"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@app": path.resolve(__dirname, "src/app"),
            "@assets": path.resolve(__dirname, "src/assets"),
            "@entities": path.resolve(__dirname, "src/entities"),
            "@features": path.resolve(__dirname, "src/features"),
            "@pages": path.resolve(__dirname, "src/pages"),
            "@shared": path.resolve(__dirname, "src/shared"),
            "@widget": path.resolve(__dirname, "src/widget"),
        },
    },
})
