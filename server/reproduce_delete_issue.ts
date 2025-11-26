
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testDeleteUser() {
    console.log("Starting delete user test...");

    // 1. Create a test user
    const testUsername = "test_delete_" + Date.now();
    const testEmail = `${testUsername}@example.com`;

    console.log(`Creating user: ${testUsername}`);

    try {
        const newUser = await storage.createUser({
            username: testUsername,
            email: testEmail,
            password: "password123",
            firstName: "Test",
            lastName: "User",
            isAdmin: false
        });

        console.log(`User created with ID: ${newUser.id}`);

        // 2. Verify user exists
        const fetchedUser = await storage.getUser(newUser.id);
        if (!fetchedUser) {
            console.error("CRITICAL: User not found immediately after creation!");
            return;
        }
        console.log("User verified in DB.");

        // 3. Delete the user
        console.log(`Attempting to delete user ${newUser.id}...`);
        const success = await storage.deleteUser(newUser.id);

        if (success) {
            console.log("SUCCESS: User deleted successfully.");
        } else {
            console.error("FAILURE: storage.deleteUser returned false.");
        }

        // 4. Verify deletion
        const deletedUser = await storage.getUser(newUser.id);
        if (deletedUser) {
            console.error("CRITICAL: User still exists after deletion!");
        } else {
            console.log("Verification: User is gone from DB.");
        }

    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        process.exit(0);
    }
}

testDeleteUser();
