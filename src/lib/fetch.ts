import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string) {
  const res = await fetch(feedURL, {
    method: "GET",
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!res.ok) {
    throw new Error(`failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const parser = new XMLParser();
  let result = parser.parse(xml);

  const channel = result.rss?.channel;

  if (!channel) {
    throw new Error("failed to parse channel");
  }

  if (
    !channel ||
    !channel.title ||
    !channel.link ||
    !channel.description ||
    !channel.item
  ) {
    throw new Error("failed to parse channel");
  }

  const feedTitle = result.rss.channel.title;
  const feedLink = result.rss.channel.link;
  const feedDescription = result.rss.channel.description;

  let items: any[] = Array.isArray(channel.item)
    ? channel.item
    : [channel.item];

  let rssItems: RSSItem[] = [];

  if (Array.isArray(items)) {
    items.map((item) => {
      if (item.title && item.link && item.description && item.pubDate) {
        const currentItem = {
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate,
        };
        rssItems.push(currentItem);
      }
    });
  }

  const rss: RSSFeed = {
    channel: {
      title: feedTitle,
      link: feedLink,
      description: feedDescription,
      item: rssItems,
    },
  };

  return rss;
}
