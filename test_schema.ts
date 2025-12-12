
import { insertUserProductSchema } from "./shared/schema";

const payload = {
    productId: "some-uuid",
    rating: 0,
    tastingNotes: "notes",
    owned: true,
    earnedAt: new Date().toISOString(),
    userId: "user-uuid"
};

try {
    const parsed = insertUserProductSchema.parse(payload);
    console.log("Parsed result:", JSON.stringify(parsed, null, 2));

    if ("earnedAt" in parsed) {
        console.log("FAIL: earnedAt was NOT stripped");
    } else {
        console.log("SUCCESS: earnedAt WAS stripped");
    }
} catch (e) {
    console.error("Validation error:", e);
}
