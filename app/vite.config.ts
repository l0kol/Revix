import path from "path";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    define: {
      "process.env": {
        TOMO_CLIENT_ID: JSON.stringify(env.VITE_TOMO_API_KEY),
        VITE_WALLET_CLOUD_KEY: JSON.stringify(env.VITE_WALLET_CLOUD_KEY),
      },
    },
    plugins: [
      nodePolyfills({
        protocolImports: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
