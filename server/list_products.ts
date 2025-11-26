
import { storage } from "./storage";
import * as fs from "fs";

async function listProducts() {
    console.log("Listing products in DB...");
    try {
        const products = await storage.getProducts();
        console.log(`Found ${products.length} products.`);

        let output = `Found ${products.length} products:\n`;
        products.slice(0, 10).forEach(p => {
            output += `- [${p.id}] ${p.name} (Image: ${p.productImage ? 'Yes' : 'No'})\n`;
        });

        fs.writeFileSync("products_list.txt", output);
        console.log("Output written to products_list.txt");
    } catch (error) {
        console.error("Failed to list products:", error);
    } finally {
        process.exit(0);
    }
}

listProducts();
