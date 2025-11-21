import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly specify the path to .env
const envPath = path.resolve(process.cwd(), ".env");
console.log("Loading .env from:", envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file:", result.error);
} else {
    console.log(".env file loaded successfully.");
}

if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL is set (length: " + process.env.DATABASE_URL.length + ")");
} else {
    console.error("DATABASE_URL is NOT set.");
    console.log("Available env keys:", Object.keys(process.env).filter(k => !k.startsWith("npm_")));
}
