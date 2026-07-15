import type { WebmentionsCache } from "@/types";

import { getFromCache, writeToCache } from "./cache";
import { fetchWebmentions } from "./client";
import { filterWebmentions, mergeWebmentions } from "./pure";

export { filterWebmentions } from "./pure";

async function getAndCacheWebmentions(): Promise<WebmentionsCache> {
	const cache = await getFromCache();
	const mentions = await fetchWebmentions(cache.lastFetched);

	if (mentions) {
		mentions.children = filterWebmentions(mentions.children);
		const webmentions: WebmentionsCache = {
			children: mergeWebmentions(cache, mentions),
			lastFetched: new Date().toISOString(),
		};

		await writeToCache(webmentions);
		return webmentions;
	}

	return cache;
}

/** module-level cache: fetch once per build, filter per page URL */
let webMentions: WebmentionsCache | undefined;

export async function getWebmentionsForUrl(url: string) {
	if (!webMentions) webMentions = await getAndCacheWebmentions();

	return webMentions.children.filter((entry) => entry["wm-target"] === url);
}
