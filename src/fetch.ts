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
  const result = await fetch(feedURL, {
    method: "GET",
    headers: {
      "User-Agent": "gator",
    },
  });
  const resposeString = result.text();
  const parser = new XMLParser();

  let jObj = parser.parse(await resposeString);

  if (!jObj.rss.channel) {
    throw new Error("RSSFeed Channel field is missing");
  }

  if (
    !jObj.rss.channel.title ||
    !jObj.rss.channel.link ||
    !jObj.rss.channel.description
  ) {
    throw new Error("Feed title, link, or description is missing");
  }

  const feedTitle = jObj.rss.channel.title;
  const feedLink = jObj.rss.channel.link;
  const feedDescription = jObj.rss.channel.description;

  let items: any[] = [];

  if (jObj.rss.channel.item) {
    items = jObj.rss.channel.item;
  }

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

  const rssFeed: RSSFeed = {
    channel: {
      title: feedTitle,
      link: feedLink,
      description: feedDescription,
      item: rssItems,
    },
  };

  return rssFeed;
}
