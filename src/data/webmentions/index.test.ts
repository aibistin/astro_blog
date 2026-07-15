import type { WebmentionsChildren } from "@/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./cache", () => ({
	getFromCache: vi.fn(),
	writeToCache: vi.fn(),
}));
vi.mock("./client", () => ({
	fetchWebmentions: vi.fn(),
}));

import { getFromCache, writeToCache } from "./cache";
import { fetchWebmentions } from "./client";
import { makeMention } from "./test-helpers";

function makeLike(id: number, target: string): WebmentionsChildren {
	return makeMention(id, "like-of", { "wm-target": target });
}

const target = "https://aibistin.com/posts/a/";

// the module memoizes fetched mentions, so re-import it fresh per test
async function importFreshModule() {
	vi.resetModules();
	return await import("./index");
}

beforeEach(() => {
	vi.mocked(getFromCache).mockReset();
	vi.mocked(writeToCache).mockReset();
	vi.mocked(fetchWebmentions).mockReset();
});

describe("getWebmentionsForUrl", () => {
	it("merges fresh mentions with the cache and filters by target url", async () => {
		vi.mocked(getFromCache).mockResolvedValue({
			children: [makeLike(1, target)],
			lastFetched: null,
		});
		vi.mocked(fetchWebmentions).mockResolvedValue({
			children: [makeLike(2, target), makeLike(3, "https://aibistin.com/posts/other/")],
			name: "feed",
			type: "feed",
		});

		const { getWebmentionsForUrl } = await importFreshModule();
		const mentions = await getWebmentionsForUrl(target);

		expect(mentions.map((m) => m["wm-id"])).toEqual([1, 2]);
		expect(writeToCache).toHaveBeenCalledOnce();
	});

	it("falls back to the cache when the fetch returns nothing", async () => {
		vi.mocked(getFromCache).mockResolvedValue({
			children: [makeLike(1, target)],
			lastFetched: "2024-01-01T00:00:00Z",
		});
		vi.mocked(fetchWebmentions).mockResolvedValue(null);

		const { getWebmentionsForUrl } = await importFreshModule();

		expect(await getWebmentionsForUrl(target)).toHaveLength(1);
		expect(writeToCache).not.toHaveBeenCalled();
	});

	it("fetches only once per build across multiple urls", async () => {
		vi.mocked(getFromCache).mockResolvedValue({ children: [], lastFetched: null });
		vi.mocked(fetchWebmentions).mockResolvedValue(null);

		const { getWebmentionsForUrl } = await importFreshModule();
		await getWebmentionsForUrl(target);
		await getWebmentionsForUrl("https://aibistin.com/posts/b/");

		expect(fetchWebmentions).toHaveBeenCalledOnce();
	});
});
