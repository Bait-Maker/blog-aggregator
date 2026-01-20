import { readConfig } from "src/config";
import { createFeed, getFeeds } from "src/lib/db/queries/feeds";
import { getUser, getUserById } from "src/lib/db/queries/users";
import { Feed, User } from "src/lib/db/schema";

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
  if (args.length !== 2) {
    throw new Error(`usage ${cmdName} <feed_name> <url>`);
  }

  const [name, url] = args;
  const config = readConfig();
  const currentUser = config.currentUserName;
  const user = await getUser(currentUser);

  if (!user) {
    throw new Error(`User ${config.currentUserName} not found`);
  }

  const feed = await createFeed(name, url, user.id);
  if (!feed) {
    throw new Error(`Failed to create feed`);
  }

  console.log("Feed created successfully:");
  printFeed(feed, user);
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
