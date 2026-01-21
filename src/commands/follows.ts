import {
  createFeedFollows,
  deleteFeedFollows,
  getFeedFollowsForUser,
} from "src/lib/db/queries/feed_follows";
import { getFeedByURL } from "src/lib/db/queries/feeds";
import { User } from "src/lib/db/schema";

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 1) {
    throw new Error(`usage ${cmdName} <feed_url>`);
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

export async function handlerListFeedFollows(
  cmdName: string,
  user: User,
  ...args: string[]
) {
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

export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 1) {
    throw new Error(`uasage ${cmdName} <feed_url>`);
  }

  const feedURL = args[0];
  const feed = await getFeedByURL(feedURL);
  if (!feed) {
    throw new Error(`Failed to find feed for url: ${feedURL}`);
  }

  const result = await deleteFeedFollows(user.id, feed.id);
  if (!result) {
    throw new Error(`Failded to unfollow feed: ${feedURL}`);
  }

  console.log(`%s unfollowed successfully!`, feed.name);
}
