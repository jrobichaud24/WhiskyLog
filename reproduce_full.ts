
import { storage } from "./server/storage";
import { BadgeService } from "./server/services/badge";
import { insertUserProductSchema } from "./shared/schema";
import * as fs from 'fs';

const logFile = 'debug_log.txt';
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
const log = (msg: any) => fs.appendFileSync(logFile, String(msg) + '\n');

async function run() {
    try {
        log("Starting reproduction script...");

        // 1. Get or create a user
        let user = await storage.getUserByUsername("testuser");
        if (!user) {
            log("Creating test user...");
            user = await storage.createUser({
                username: "testuser",
                email: "test@example.com",
                password: "password123",
                firstName: "Test",
                lastName: "User"
            });
        }
        log("User ID: " + user.id);

        // 2. Get a product
        const products = await storage.getProducts();
        if (products.length === 0) {
            log("No products found. Cannot test.");
            return;
        }
        const product = products[0];
        log("Product ID: " + product.id);

        // 3. Prepare payload (mimic client)
        const payload = {
            productId: product.id,
            rating: 0,
            tastingNotes: "TEST NOTES",
            owned: true,
            earnedAt: new Date().toISOString(),
            userId: user.id
        };

        // 4. Validate schema
        log("Validating schema...");
        const validatedData = insertUserProductSchema.parse(payload);
        log("Schema validated.");

        // 5. Check existence
        const existing = await storage.getUserProduct(user.id, product.id);
        if (existing) {
            log("Product already in collection, removing it to test...");
            await storage.deleteUserProduct(existing.id);
        }

        // 6. Create User Product
        log("Creating user product...");
        const userProduct = await storage.createUserProduct(validatedData);
        log("User product created: " + userProduct.id);

        // 7. Check Badges
        log("Checking badges...");
        await BadgeService.checkAndAwardBadges(user.id);
        log("Badges checked successfully.");

    } catch (error) {
        log("ERROR CAUGHT:");
        log(error instanceof Error ? error.stack : JSON.stringify(error));
    }
    process.exit(0);
}

run();
