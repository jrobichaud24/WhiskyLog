
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import { registerRoutes } from '../server/routes';
// Mock Anthropic BEFORE importing routes? 
// No, routes imports Anthropic at top level.
// We need to mock the module storage or behavior if possible, but mocking module in esm/ts-node is hard without jest.

// Instead of mocking, we can just let Anthropic run if the key is present.
// If the user said "The whisky now adds correctly", Anthropic is working.
// So we can assume ANTHROPIC_API_KEY is valid.

// The goal is to trigger the Google Search block.
// We can manipulate the request to "identify-whisky-text".

async function run() {
    console.log("Checking Env...");
    console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Present, len=" + process.env.GOOGLE_API_KEY.length : "Missing");
    console.log("GOOGLE_CX:", process.env.GOOGLE_CX ? "Present, len=" + process.env.GOOGLE_CX.length : "Missing");

    const app = express();
    app.use(express.json());
    // Mock session
    app.use((req, res, next) => {
        (req as any).session = { userId: 1 }; // Mock user
        next();
    });

    await registerRoutes(app as any);

    const port = 3002;
    const server = app.listen(port, async () => {
        console.log(`Debug server listening on ${port}`);

        try {
            // Trigger the endpoint
            // We use a query that definitely recruits Anthropic
            const query = "Lagavulin 16";
            console.log(`Sending query: ${query}`);

            const res = await fetch(`http://localhost:${port}/api/identify-whisky-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            const data = await res.json();
            console.log("Response Status:", res.status);
            // console.log("Response Data:", JSON.stringify(data, null, 2));

            // We check logs (stdout/stderr) for the Google Search Error.
            // Since this script runs in the same process (mostly), we should see the logs.

        } catch (e) {
            console.error(e);
        } finally {
            server.close();
            process.exit(0);
        }
    });
}

run();
