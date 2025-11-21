import { db } from "./db";
import { distilleries } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    console.log("🌱 Starting database seed...");

    try {
        // Read sample data
        const dataPath = path.join(__dirname, "..", "sample_distilleries.json");
        const rawData = fs.readFileSync(dataPath, "utf-8");
        const distilleryData = JSON.parse(rawData);

        console.log(`Found ${distilleryData.length} distilleries to insert.`);

        // Insert data
        await db.insert(distilleries).values(distilleryData).onConflictDoNothing();

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seed();
