import { describe, expect, it } from "vitest";

import { filterWebmentions, mergeWebmentions } from "./pure";
import { makeMention } from "./test-helpers";

const textContent = { "content-type": "text/plain", html: "", text: "hello", value: "hello" };

describe("filterWebmentions", () => {
	it("drops unsupported mention types", () => {
		expect(filterWebmentions([makeMention(1, "bookmark-of")])).toEqual([]);
	});

	it("keeps likes without content", () => {
		expect(filterWebmentions([makeMention(1, "like-of")])).toHaveLength(1);
	});

	it("drops replies and mentions without text content", () => {
		expect(
			filterWebmentions([
				makeMention(1, "mention-of"),
				makeMention(2, "in-reply-to", { content: { ...textContent, text: "" } }),
			]),
		).toEqual([]);
	});

	it("keeps replies and mentions with text content", () => {
		const kept = filterWebmentions([
			makeMention(1, "mention-of", { content: textContent }),
			makeMention(2, "in-reply-to", { content: textContent }),
		]);
		expect(kept).toHaveLength(2);
	});
});

describe("mergeWebmentions", () => {
	it("appends new mentions to cached ones", () => {
		const merged = mergeWebmentions(
			{ children: [makeMention(1, "like-of")], lastFetched: null },
			{ children: [makeMention(2, "like-of")], name: "", type: "feed" },
		);
		expect(merged.map((m) => m["wm-id"])).toEqual([1, 2]);
	});

	it("dedupes by wm-id, letting the fresh mention win", () => {
		const stale = makeMention(1, "like-of", { url: "https://example.com/stale" });
		const fresh = makeMention(1, "like-of", { url: "https://example.com/fresh" });

		const merged = mergeWebmentions(
			{ children: [stale], lastFetched: null },
			{ children: [fresh], name: "", type: "feed" },
		);
		expect(merged).toHaveLength(1);
		expect(merged[0]?.url).toBe("https://example.com/fresh");
	});
});
