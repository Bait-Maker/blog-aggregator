import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feed_follows, feeds, users } from "../schema";

export async function createFeedFollows(feedId: string, userId: string) {
  const [newFeedFollow] = await db
    .insert(feed_follows)
    .values({
      userId,
      feedId,
    })
    .returning();

  const [result] = await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(
      and(
        eq(feed_follows.id, newFeedFollow.id),
        eq(users.id, newFeedFollow.userId),
      ),
    );

  return result;
}

export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      userId: feed_follows.userId,
      feedId: feed_follows.feedId,
      feedName: feeds.name,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .where(eq(feed_follows.userId, userId));
}

export async function deleteFeedFollows(userId: string, feedId: string) {
  const [result] = await db
    .delete(feed_follows)
    .where(
      and(eq(feed_follows.userId, userId), eq(feed_follows.feedId, feedId)),
    )
    .returning();

  return result;
}
