
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const LOG_FILE = 'debug_log.txt';
fs.writeFileSync(LOG_FILE, ''); // Clear log

function log(message: string) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

async function testGoogleSeach() {
    const realKey = process.env.GOOGLE_API_KEY;
    const realCx = process.env.GOOGLE_CX;

    if (!realKey || !realCx) {
        log("Missing GOOGLE_API_KEY or GOOGLE_CX");
        return;
    }

    const scenarios = [
        { name: "Invalid CX", key: realKey, cx: "undefined", q: "Lagavulin" },
        { name: "Missing CX", key: realKey, cx: "", q: "Lagavulin" }, // Might default to something?
        { name: "Invalid Key", key: "invalid_key", cx: realCx, q: "Lagavulin" },
        { name: "Undefined String CX", key: realKey, cx: "undefined", q: "Lagavulin" },
    ];

    for (const scenario of scenarios) {
        log(`\n--- Testing ${scenario.name} ---`);
        const qParam = encodeURIComponent(scenario.q + " whisky bottle");
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${scenario.key}&cx=${scenario.cx}&q=${qParam}&searchType=image&num=1`;

        try {
            const response = await fetch(googleUrl);
            const data = await response.json();

            if (data.error) {
                log("FAIL: " + JSON.stringify(data.error, null, 2));
            } else {
                log("SUCCESS. Items found: " + (data.items?.length || 0));
            }
        } catch (error) {
            log("EXCEPTION: " + error);
        }
    }
}

testGoogleSeach();
