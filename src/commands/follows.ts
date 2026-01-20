import { readConfig } from "src/config";
import {
  createFeedFollows,
  getFeedFollowsForUser,
} from "src/lib/db/queries/feed_follows";
import { getFeedByURL } from "src/lib/db/queries/feeds";
import { getUser } from "src/lib/db/queries/users";

export async function handlerFollow(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage ${cmdName} <feed_url>`);
  }

  const config = readConfig();
  const user = await getUser(config.currentUserName);

  if (!user) {
    throw new Error(`User ${config.currentUserName} not found`);
  }

  const feedURL = args[0];
  const feed = await getFeedByURL(feedURL);
  if (!feed) {
    throw new Error(`Feed with url ${feedURL} not found`);
  }

  const feedFollows = await createFeedFollows(feed.id, user.id);

  console.log("Feed follow created:");
  printFeed(feedFollows.feedName, feedFollows.userName);
}

export async function hanlderListFeedFollows(_: string) {
  const config = readConfig();
  const user = await getUser(config.currentUserName);

  if (!user) {
    throw new Error(`user ${config.currentUserName} not found`);
  }

  const feedFollows = await getFeedFollowsForUser(user.id);

  if (feedFollows.length === 0) {
    console.log(`No feed follows found for ${user.name}`);
    return;
  }

  console.log(`Feed follows for user %s:`, user.name);

  for (let ff of feedFollows) {
    console.log(`* %s`, ff.feedName);
  }
}

function printFeed(feedName: string, userName: string) {
  console.log(`* FeedName:          ${feedName}`);
  console.log(`* UserName:          ${userName}`);
}
