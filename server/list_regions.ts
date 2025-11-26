
import { storage } from "./storage";
import * as fs from "fs";

async function listRegions() {
    console.log("Listing distillery regions...");
    try {
        const distilleries = await storage.getDistilleries();
        const regionCounts: Record<string, number> = {};

        distilleries.forEach(d => {
            const region = d.region || "Unknown";
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        });

        console.log("Region Counts:", regionCounts);

        fs.writeFileSync("regions_list.txt", JSON.stringify(regionCounts, null, 2));
    } catch (error) {
        console.error("Failed to list regions:", error);
    } finally {
        process.exit(0);
    }
}

listRegions();
