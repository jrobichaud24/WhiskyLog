import { createServer } from "http";
import express from "express";
import session from "express-session";
import { registerRoutes } from "../server/routes";
import { storage } from "../server/storage";

// Mock Anthropic response
jest.mock('@anthropic-ai/sdk', () => {
    return {
        Anthropic: jest.fn().mockImplementation(() => ({
            messages: {
                create: jest.fn().mockResolvedValue({
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                name: "Test Whisky 12",
                                distillery: "Test Distillery",
                                age: "12 Year Old",
                                abv: "43%",
                                description: "A test whisky description."
                            })
                        }
                    ]
                })
            }
        }))
    };
});

async function runTest() {
    console.log("Starting AI Search Test...");

    // Setup minimal server
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Mock session
    app.use((req, res, next) => {
        (req as any).session = { userId: 1 }; // Mock logged in user
        next();
    });

    const server = registerRoutes(app);

    // We need to listen to a port to make requests, but for this test we can just call the handler directly if we structure it right,
    // or use supertest. But since we don't have supertest installed, let's just run the server and use fetch.

    const PORT = 3001;
    const httpServer = server.listen(PORT, async () => {
        console.log(`Test server running on port ${PORT}`);

        try {
            // Test 1: Search for a new whisky
            console.log("\nTest 1: Searching for 'Test Whisky 12'...");
            const response1 = await fetch(`http://localhost:${PORT}/api/identify-whisky-text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: "Test Whisky 12" })
            });

            const data1 = await response1.json();
            console.log("Response 1:", JSON.stringify(data1, null, 2));

            if (data1.success && data1.whiskyData.name === "Test Whisky 12") {
                console.log("✅ Test 1 Passed: AI identified the whisky.");
            } else {
                console.error("❌ Test 1 Failed.");
            }

        } catch (error) {
            console.error("Test Error:", error);
        } finally {
            httpServer.close();
            console.log("\nTest completed.");
            process.exit(0);
        }
    });
}

runTest().catch(console.error);
