import { db } from "./db";
import { distilleries, badges } from "@shared/schema";
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
        // const dataPath = path.join(__dirname, "..", "sample_distilleries.json");
        // const rawData = fs.readFileSync(dataPath, "utf-8");
        // const distilleryData = JSON.parse(rawData);

        // console.log(`Found ${distilleryData.length} distilleries to insert.`);

        // Insert distilleries
        // await db.insert(distilleries).values(distilleryData).onConflictDoNothing();

        // Seed Badges
        console.log("🏅 Seeding badges...");
        const badgesData = [
            {
                name: "First Dram",
                slug: "first-dram",
                description: "Rate your first whisky.",
                icon: "GlassWater",
                category: "tasting",
                rarity: "common",
                requirement: "Rate 1 whisky",
                triggerType: "tasting_count",
                targetValue: 1,
                imageUrl: "/icons/badges/first-dram.png"
            },
            {
                name: "Whisky Enthusiast",
                slug: "whisky-enthusiast",
                description: "Rate 10 whiskies.",
                icon: "Award",
                category: "tasting",
                rarity: "common",
                requirement: "Rate 10 whiskies",
                triggerType: "tasting_count",
                targetValue: 10,
                imageUrl: "/icons/badges/whisky-enthusiast.png"
            },
            {
                name: "Connoisseur",
                slug: "connoisseur",
                description: "Rate 50 whiskies.",
                icon: "Crown",
                category: "tasting",
                rarity: "rare",
                requirement: "Rate 50 whiskies",
                triggerType: "tasting_count",
                targetValue: 50,
                imageUrl: "/icons/badges/connoisseur.png"
            },
            {
                name: "Collection Starter",
                slug: "collection-starter",
                description: "Add 5 bottles to your collection.",
                icon: "Library",
                category: "collection",
                rarity: "common",
                requirement: "Own 5 whiskies",
                triggerType: "owned_count",
                targetValue: 5,
                imageUrl: "/icons/badges/collection-starter.png"
            },
            {
                name: "Serious Collector",
                slug: "serious-collector",
                description: "Add 20 bottles to your collection.",
                icon: "Gem",
                category: "collection",
                rarity: "rare",
                requirement: "Own 20 whiskies",
                triggerType: "owned_count",
                targetValue: 20,
                imageUrl: "/icons/badges/serious-collector.png"
            },
            {
                name: "Highland Explorer",
                slug: "highland-explorer",
                description: "Try 5 whiskies from the Highland region.",
                icon: "Mountain",
                category: "exploration",
                rarity: "common",
                requirement: "Rate 5 Highland whiskies",
                triggerType: "region_count",
                targetValue: 5,
                imageUrl: "/icons/badges/highland-explorer.png"
            },
            {
                name: "Islay Fan",
                slug: "islay-fan",
                description: "Try 5 whiskies from Islay.",
                icon: "Waves",
                category: "exploration",
                rarity: "common",
                requirement: "Rate 5 Islay whiskies",
                triggerType: "region_count",
                targetValue: 5,
                imageUrl: null // TODO: Generate image
            },
            {
                name: "Speyside Specialist",
                slug: "speyside-specialist",
                description: "Try 5 whiskies from Speyside.",
                icon: "Droplets",
                category: "exploration",
                rarity: "common",
                requirement: "Rate 5 Speyside whiskies",
                triggerType: "region_count",
                targetValue: 5,
                imageUrl: null // TODO: Generate image
            }
        ];

        // Insert badges one by one to handle conflicts gracefully
        for (const badge of badgesData) {
            await db.insert(badges).values(badge).onConflictDoUpdate({
                target: badges.slug,
                set: { imageUrl: badge.imageUrl }
            });
        }

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seed();
