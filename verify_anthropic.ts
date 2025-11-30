import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY is missing from .env file");
    process.exit(1);
}

console.log(`🔑 Testing with API Key: ${apiKey.substring(0, 8)}... (Length: ${apiKey.length})`);

const anthropic = new Anthropic({
    apiKey: apiKey.trim(),
});

async function testConnection() {
    const models = [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-sonnet-20240620',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1'
    ];

    console.log("🔍 Testing available models...");

    for (const model of models) {
        try {
            console.log(`\n👉 Testing model: ${model}...`);
            const message = await anthropic.messages.create({
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }],
                model: model,
            });

            console.log(`✅ SUCCESS! Model ${model} is working.`);
            console.log(`   Response: ${JSON.stringify(message.content[0])}`);

            // If we find a working model, we can stop or keep testing to see all available
            // Let's just stop at the first working one for now to give a recommendation
            console.log(`\n🎉 RECOMMENDED FIX: Update server/routes.ts to use model: "${model}"`);
            return;

        } catch (error: any) {
            console.error(`❌ FAILED: ${model}`);
            if (error.status === 404) {
                console.error(`   Error: Model not found (Access Denied)`);
            } else {
                console.error(`   Error: ${error.message}`);
            }
        }
    }

    console.error("\n❌ ALL MODELS FAILED. Please check your API key credits and permissions.");
}

testConnection();
