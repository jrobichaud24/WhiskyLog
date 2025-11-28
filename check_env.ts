
import 'dotenv/config';

console.log("Checking environment variables...");
if (process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY is set");
} else {
    console.log("ANTHROPIC_API_KEY is NOT set");
}
