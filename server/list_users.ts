
import { storage } from "./storage";
import * as fs from "fs";

async function listUsers() {
    console.log("Listing all users in DB...");
    try {
        const users = await storage.getUsers();
        let output = `Found ${users.length} users:\n`;
        users.forEach(u => {
            output += `- [${u.id}] ${u.username} (${u.email}) isAdmin=${u.isAdmin}\n`;
        });
        fs.writeFileSync("users_list.txt", output);
        console.log("Output written to users_list.txt");
    } catch (error) {
        console.error("Failed to list users:", error);
    } finally {
        process.exit(0);
    }
}

listUsers();
