import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import { fetchFeed } from "src/lib/rss";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`Usage ${cmdName} <time_between_reqs> (ex: 1m)`);
  }

  const timeArg = args[0];

  const timeBetweenRequests = parseDuration(timeArg);

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
  const feedToFetch = await getNextFeedToFetch();

  if (!feedToFetch) {
    throw new Error(`Failed to find feed`);
  }

  const fetchedFeed = await markFeedFetched(feedToFetch.id);
  const feed = await fetchFeed(fetchedFeed.url);

  if (!feed) {
    throw new Error(`Failed to find feed with url: ${fetchedFeed.url}`);
  }

  for (let item of feed.channel.item) {
    console.log(`* ${item.title}`);
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
