import { db } from "../db";
import { badges, userBadges, userProducts, products, distilleries } from "@shared/schema";
import { eq, and, count, sql } from "drizzle-orm";

export class BadgeService {
    static async checkAndAwardBadges(userId: string) {
        console.log(`Checking badges for user ${userId}...`);

        // Get all active badges
        const allBadges = await db.select().from(badges).where(eq(badges.isActive, true));

        // Get badges already earned by user
        const earnedBadges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
        const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId));

        const newBadges = [];

        for (const badge of allBadges) {
            if (earnedBadgeIds.has(badge.id)) continue;

            let earned = false;

            switch (badge.triggerType) {
                case "tasting_count":
                    earned = await this.checkTastingCount(userId, badge.targetValue);
                    break;
                case "owned_count":
                    earned = await this.checkOwnedCount(userId, badge.targetValue);
                    break;
                case "region_count":
                    earned = await this.checkRegionCount(userId, badge.slug, badge.targetValue);
                    break;
            }

            if (earned) {
                console.log(`User ${userId} earned badge: ${badge.name}`);
                await db.insert(userBadges).values({
                    userId,
                    badgeId: badge.id,
                    earnedAt: new Date(),
                });
                newBadges.push(badge);
            }
        }

        return newBadges;
    }

    private static async checkTastingCount(userId: string, target: number): Promise<boolean> {
        const result = await db
            .select({ count: count() })
            .from(userProducts)
            .where(and(
                eq(userProducts.userId, userId),
                sql`${userProducts.rating} IS NOT NULL`
            ));

        return result[0].count >= target;
    }

    private static async checkOwnedCount(userId: string, target: number): Promise<boolean> {
        const result = await db
            .select({ count: count() })
            .from(userProducts)
            .where(and(
                eq(userProducts.userId, userId),
                eq(userProducts.owned, true)
            ));

        return result[0].count >= target;
    }

    private static async checkRegionCount(userId: string, badgeSlug: string, target: number): Promise<boolean> {
        // Map badge slug to region name
        let region = "";
        if (badgeSlug === "highland-explorer") region = "Highland";
        else if (badgeSlug === "islay-fan") region = "Islay";
        else if (badgeSlug === "speyside-specialist") region = "Speyside";
        else return false;

        // Join userProducts -> products -> distilleries to filter by region
        const result = await db
            .select({ count: count() })
            .from(userProducts)
            .innerJoin(products, eq(userProducts.productId, products.id))
            .innerJoin(distilleries, eq(products.distillery, distilleries.id))
            .where(and(
                eq(userProducts.userId, userId),
                sql`${userProducts.rating} IS NOT NULL`,
                eq(distilleries.region, region)
            ));

        return result[0].count >= target;
    }
}
