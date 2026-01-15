import { fetchFeed } from "src/fetch";

export async function handlerAgg(_: string) {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(JSON.stringify(feed, null, 2));
}
