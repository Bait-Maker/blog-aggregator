import { readConfig } from "src/config";
import { createFeedFollows } from "src/lib/db/queries/feed_follows";
import { createFeed, getFeeds } from "src/lib/db/queries/feeds";
import { getUser, getUserById } from "src/lib/db/queries/users";
import { Feed, User } from "src/lib/db/schema";

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 2) {
    throw new Error(`usage ${cmdName} <feed_name> <url>`);
  }

  const [name, url] = args;

  const feed = await createFeed(name, url, user.id);
  if (!feed) {
    throw new Error(`Failed to create feed`);
  }

  console.log("Feed created successfully:");
  printFeed(feed, user);

  const feedFollow = await createFeedFollows(feed.id, user.id);
  if (!feedFollow) {
    throw new Error("Failed to create feed follow");
  }
  console.log("Feed followed successfully!");
  console.log(`* FeedName:    ${feedFollow.feedName}`);
  console.log(`* UserName:    ${feedFollow.userName}`);
}

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:             ${feed.id}`);
  console.log(`* Created:        ${feed.createdAt}`);
  console.log(`* Updated:        ${feed.updatedAt}`);
  console.log(`* name:           ${feed.name}`);
  console.log(`* URL:            ${feed.url}`);
  console.log(`* User:           ${user.name}`);
}

export async function handlerListFeeds(_: string) {
  const feeds = await getFeeds();

  if (feeds.length === 0) {
    console.log(`No feeds found.`);
    return;
  }

  console.log(`Found %d feeds:\n`, feeds.length);

  for (let feed of feeds) {
    const user = await getUserById(feed.userId);
    if (!user) {
      throw new Error(`Failed to find user for feed ${feed.id}`);
    }

    printFeed(feed, user);
    console.log("=======================================");
  }
}
