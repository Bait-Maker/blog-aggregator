import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import { createPost } from "src/lib/db/queries/posts";
import { Feed, newPost } from "src/lib/db/schema";
import { fetchFeed } from "src/lib/rss";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`Usage ${cmdName} <time_between_reqs>`);
  }

  const timeArg = args[0];

  const timeBetweenRequests = parseDuration(timeArg);

  if (!timeBetweenRequests) {
    throw new Error(
      `invalid duration: ${timeArg} - use format 1h 30m 15s or 3500ms`,
    );
  }

  console.log(`Collecting feeds every ${timeArg}`);

  // run the first scape immediately
  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    throw new Error(`Failed to find feed`);
  }

  if (!feed) {
    console.log("No feeds to fetch");
    return;
  }
  console.log("Found feed to fetch!");
  scrapeFeed(feed);
}

async function scrapeFeed(feed: Feed) {
  await markFeedFetched(feed.id);

  const feedData = await fetchFeed(feed.url);
  for (let item of feedData.channel.item) {
    console.log(`Found posts: ${item.title}`);

    const now = new Date();

    await createPost({
      url: item.link,
      feedId: feed.id,
      title: item.title,
      createdAt: now,
      updatedAt: now,
      description: item.description,
      publishedAt: new Date(item.pubDate),
    } satisfies newPost);
  }
}

function parseDuration(durationStr: string) {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    return;
  }

  if (match.length !== 3) return;

  const value = parseInt(match[1], 10);
  const duration = match[2];

  switch (duration) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 1000 * Math.pow(60, 2);
    default:
      return;
  }
}

async function handleError(err: unknown) {
  console.error(
    `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
  );
}
