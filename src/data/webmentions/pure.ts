import type { WebmentionsCache, WebmentionsChildren, WebmentionsFeed } from "@/types";

const validWebmentionTypes = ["like-of", "mention-of", "in-reply-to"];

/** keep only supported mention types; 'mention-of'/'in-reply-to' must have text content */
export function filterWebmentions(webmentions: WebmentionsChildren[]) {
	return webmentions.filter((webmention) => {
		if (!validWebmentionTypes.includes(webmention["wm-property"])) return false;

		if (webmention["wm-property"] === "mention-of" || webmention["wm-property"] === "in-reply-to") {
			return !!webmention.content && webmention.content.text !== "";
		}

		return true;
	});
}

/** merge cached entries [a] with fresh webmentions [b], deduplicated by wm-id (fresh wins) */
export function mergeWebmentions(a: WebmentionsCache, b: WebmentionsFeed): WebmentionsChildren[] {
	return Array.from(
		[...a.children, ...b.children]
			.reduce((map, obj) => map.set(obj["wm-id"], obj), new Map<number, WebmentionsChildren>())
			.values(),
	);
}
