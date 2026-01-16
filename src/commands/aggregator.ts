import { fetchFeed } from "src/lib/rss";

export async function handlerAgg(_: string) {
  const feedURL = "https://www.wagslane.dev/index.xml";

  const feed = await fetchFeed(feedURL);
  const feedDataStr = JSON.stringify(feed, null, 2);
  console.log(feedDataStr);
}
