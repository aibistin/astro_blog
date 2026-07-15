import type { WebmentionsChildren } from "@/types";

/** shared fixture factory for the webmentions test files */
export function makeMention(
	id: number,
	property: string,
	overrides: Partial<WebmentionsChildren> = {},
): WebmentionsChildren {
	return {
		author: null,
		"mention-of": "",
		type: "entry",
		url: `https://example.com/${id}`,
		"wm-id": id,
		"wm-private": false,
		"wm-property": property,
		"wm-protocol": "webmention",
		"wm-received": "2024-01-01T00:00:00Z",
		"wm-source": `https://example.com/${id}`,
		"wm-target": "https://aibistin.com/posts/a/",
		...overrides,
	};
}
