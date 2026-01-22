import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import { fetchFeed } from "src/lib/rss";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`Usage ${cmdName} <duration> (ex: 1m)`);
  }

  const time_between_reqs = args[0];

  const timeBetweenRequests = parseDuration(time_between_reqs);

  console.log(`Collecting feeds every ${time_between_reqs}`);

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

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    throw new Error(`Duration string wrong, correct format: 1s, 1m, or 1h`);
  }

  const num = Number(match[1]);
  const duration = match[2];
  let durationMiliseconds: number;

  switch (duration) {
    case "ms":
      durationMiliseconds = num;
      break;
    case "s":
      durationMiliseconds = num * 1000;
      break;
    case "m":
      durationMiliseconds = num * 60000;
      break;
    case "h":
      durationMiliseconds = num * 1000 * Math.pow(60, 2);
      break;
    default:
      return 0;
  }

  return durationMiliseconds;
}

async function handleError(err: Error) {
  console.error("Something went wrong", err);
}
