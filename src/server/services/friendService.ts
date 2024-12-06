import { and, eq } from "drizzle-orm";
import { friends } from "../db/schema";
import { db } from "../db";
import { users } from "../db/schema"; // Assuming you have a users table

export async function getFollowing(userId: number) {
    try {
        const following = await db
            .select({
                id: users.id,
                name: users.username,
                role: users.role,
            })
            .from(friends)
            .innerJoin(users, eq(friends.friendId, users.id))
            .where(eq(friends.userId, userId))
            .catch((e: any) => {
                throw new Error(e);
            });
        return following;
    } catch (error) {
        throw new Error("Error getting following");
    }
}

export async function follow(userId: number, friendId: number) {
    try {
        const follow = await db.transaction(async (trx) => {
            await trx
                .insert(friends).values({ friendId: friendId, userId: userId });

            const friendInformation = await trx
                .select({
                    name: users.username,
                    role: users.role,
                })
                .from(users)
                .where(eq(users.id, friendId));

            return friendInformation;
        });

        return follow
    } catch (error) {
        throw new Error("Error following user");
    }
}


export async function unfollow(userId: number, friendId: number) {
    const unfollow = await db
        .delete(friends)
        .where(and(eq(friends.userId, userId), eq(friends.friendId, friendId)))
        .catch((error) => {
            throw new Error("Error unfollowing user: " + error.message);
        });
    if (unfollow.rowCount === 0) {
        throw new Error("User not found");
    }
    return unfollow;
}


export async function getFollowers(offset: number, userId: number) {
    try {
        const followers = await db
            .select({
                name: users.username,
                role: users.role,
            })
            .from(friends)
            .innerJoin(users, eq(friends.userId, users.id))
            .where(eq(friends.friendId, userId))
            .limit(10)
            .offset(offset)
            .catch((e: any) => {
                throw new Error(e);
            });
        return followers;
    } catch (error) {
        throw new Error("Error getting followers");
    }
}