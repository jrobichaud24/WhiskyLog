
import fs from "fs";
import path from "path";
import { convertCSVToJSON } from "../client/src/lib/csvUtils";

async function testUpload() {
    const csvPath = path.resolve(process.cwd(), "Products_Dev_Replit.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    console.log("Parsing CSV...");
    const products = convertCSVToJSON(csvContent, "products");
    console.log(`Parsed ${products.length} products.`);

    const BASE_URL = "http://localhost:5000";
    const cookieJar: any = {};

    async function request(method: string, url: string, body?: any) {
        const headers: any = { "Content-Type": "application/json" };
        if (cookieJar.session) {
            headers["Cookie"] = cookieJar.session;
        }

        const res = await fetch(`${BASE_URL}${url}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
            cookieJar.session = setCookie.split(";")[0];
        }

        return res;
    }

    // 1. Signup/Login
    console.log("Logging in...");
    const username = "testuser_" + Date.now();
    const email = `${username}@example.com`;

    const signupRes = await request("POST", "/api/auth/signup", {
        username,
        password: "password123",
        email,
        firstName: "Test",
        lastName: "User"
    });

    if (!signupRes.ok) {
        console.error("Signup failed:", await signupRes.text());
        return;
    }
    console.log("User created.");

    // 2. Upload
    console.log("Uploading products...");
    // Take a small subset to avoid huge logs, but enough to hit a missing distillery
    const batch = products.slice(0, 5);

    const res = await request("POST", "/api/products/bulk", batch);
    console.log(`Upload Status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
        const text = await res.text();
        console.log("Error Body written to error.json");
        fs.writeFileSync("error.json", text);
    } else {
        const data = await res.json();
        console.log("Success:", data);
    }
}

testUpload().catch(console.error);
