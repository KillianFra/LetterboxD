import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { friends } from "../db/schema.ts";


export function retrieveFriendsByUserId(userId: number) {
    return db.select().from(friends).where(eq(friends.userId, userId));
}
