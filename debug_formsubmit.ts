
import fetch from 'node-fetch';

async function testFormSubmit() {
    // Reverting to the hashed ID to see if it is activated
    const url = 'https://formsubmit.co/ajax/5269524351507551393e6e68721463c0';
    const data = {
        name: "Debug Script User",
        email: "test@example.com",
        subject: "Debug Script Test - Hashed ID",
        message: "This is a test message sent via the debug script to the hashed ID.",
        _captcha: "false"
    };

    console.log(`Sending POST request to ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Referer': 'http://localhost:5000/contact',
                'Origin': 'http://localhost:5000'
            },
            body: JSON.stringify(data)
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        console.log("Response Body:", text);

        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON:", json);
        } catch (e) {
            console.log("Response is not valid JSON.");
        }

    } catch (error) {
        console.error("Error sending request:", error);
    }
}

testFormSubmit();
