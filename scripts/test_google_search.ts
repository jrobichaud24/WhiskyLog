
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const LOG_FILE = 'debug_log.txt';
fs.writeFileSync(LOG_FILE, '');

function log(message: string) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

async function testGoogleSeach() {
    const realKey = process.env.GOOGLE_API_KEY; // Length 39
    const realCx = process.env.GOOGLE_CX;       // Length 17

    if (!realKey || !realCx) {
        log("Missing GOOGLE_API_KEY or GOOGLE_CX");
        return;
    }

    // Verify if real keys work first
    log("Verifying baseline...");
    await runRequest(realKey, realCx, "Baseline");

    const scenarios = [
        { name: "Key with leading space", key: " " + realKey, cx: realCx },
        { name: "Key with trailing space", key: realKey + " ", cx: realCx },
        { name: "CX with leading space", key: realKey, cx: " " + realCx },
        { name: "CX with trailing space", key: realKey, cx: realCx + " " },
        { name: "CX with newline", key: realKey, cx: realCx + "\n" },
        { name: "Key with newline", key: realKey + "\n", cx: realCx },
    ];

    for (const scenario of scenarios) {
        await runRequest(scenario.key, scenario.cx, scenario.name);
    }
}

async function runRequest(key: string, cx: string, name: string) {
    log(`\n--- Testing ${name} ---`);
    // Note: we inject key/cx directly into URL string as the server does
    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=test&searchType=image&num=1`;

    try {
        const response = await fetch(googleUrl);
        const data = await response.json();

        if (data.error) {
            log(`FAIL (${response.status}): ` + JSON.stringify(data.error, null, 2));
        } else {
            log(`SUCCESS (${response.status}). Items: ` + (data.items?.length || 0));
        }
    } catch (error) {
        log("EXCEPTION: " + error);
    }
}

testGoogleSeach();
