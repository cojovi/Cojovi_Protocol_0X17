import path from "node:path";
import { fileURLToPath } from "node:url";

/** Pin Tailwind resolution to this project (not the volume cwd in Turbopack workers). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: projectRoot,
    },
  },
};

export default config;
