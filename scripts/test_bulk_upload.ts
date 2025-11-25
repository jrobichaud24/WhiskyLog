
import { insertUserSchema } from "@shared/schema";

const BASE_URL = "http://localhost:5000";

async function runTest() {
    console.log("Starting bulk upload test...");

    // 1. Create a user to get a session
    const username = `testuser_${Date.now()}`;
    const password = "password123";
    const email = `${username}@example.com`;

    console.log(`Creating user: ${username}`);

    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, firstName: "Test", lastName: "User" })
    });

    if (!signupRes.ok) {
        console.error("Signup failed:", await signupRes.text());
        return;
    }

    const cookie = signupRes.headers.get("set-cookie");
    console.log("User created, got cookie:", cookie);

    // 2. Prepare bulk upload data
    const products = [
        {
            name: `Test Whisky ${Date.now()}`,
            distillery: `New Distillery ${Date.now()}`, // New distillery name
            price: "£50.00",
            abvPercent: "46.0",
            volumeCl: "70",
            category: "Single Malt",
            type: "Scotch",
            description: "A test whisky",
            productImage: "https://example.com/image.jpg"
        }
    ];

    console.log("Uploading products:", JSON.stringify(products, null, 2));

    // 3. Perform bulk upload
    const uploadRes = await fetch(`${BASE_URL}/api/products/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie || ""
        },
        body: JSON.stringify(products)
    });

    if (!uploadRes.ok) {
        console.error("Upload failed:", await uploadRes.text());
        return;
    }

    const result = await uploadRes.json();
    console.log("Upload success:", JSON.stringify(result, null, 2));

    if (result.newDistilleries && result.newDistilleries.length > 0) {
        console.log("✅ Verified: New distillery created.");
    } else {
        console.error("❌ Failed: New distillery NOT created.");
    }
}

runTest().catch(console.error);
