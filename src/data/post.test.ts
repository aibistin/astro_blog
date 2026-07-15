import type { CollectionEntry } from "astro:content";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({
	getCollection: vi.fn(),
}));

import { getCollection } from "astro:content";

import { siteConfig } from "@/site-config";

import {
	getAllPosts,
	getAllTags,
	getPostDisplayDate,
	getPostSortDate,
	getPostUrl,
	getSortedPosts,
	getUniqueTags,
	getUniqueTagsWithCount,
	groupPostsByYear,
	sortMDByDate,
} from "./post";

type PostData = CollectionEntry<"post">["data"];
type PostFilter = (entry: CollectionEntry<"post">) => unknown;

/** the draft filter callback getAllPosts passed to the mocked getCollection */
function capturedFilter(callIndex: number) {
	return vi.mocked(getCollection).mock.calls[callIndex]?.[1] as PostFilter | undefined;
}

function makePost(id: string, data: Partial<PostData> = {}): CollectionEntry<"post"> {
	return {
		collection: "post",
		data: {
			description: "x".repeat(60),
			draft: false,
			publishDate: new Date(2024, 0, 1),
			tags: [],
			title: `Post ${id}`,
			...data,
		},
		id,
	} as CollectionEntry<"post">;
}

afterEach(() => {
	vi.mocked(getCollection).mockReset();
	siteConfig.sortPostsByUpdatedDate = false;
});

describe("getAllPosts", () => {
	it("filters out drafts in prod but keeps them in dev", async () => {
		vi.mocked(getCollection).mockResolvedValue([]);

		await getAllPosts(true);
		const prodFilter = capturedFilter(0);
		expect(prodFilter?.(makePost("draft", { draft: true }))).toBe(false);
		expect(prodFilter?.(makePost("live"))).toBe(true);

		await getAllPosts(false);
		const devFilter = capturedFilter(1);
		expect(devFilter?.(makePost("draft", { draft: true }))).toBe(true);
	});
});

describe("getSortedPosts", () => {
	it("returns posts newest first", async () => {
		vi.mocked(getCollection).mockResolvedValue([
			makePost("old", { publishDate: new Date(2020, 0, 1) }),
			makePost("new", { publishDate: new Date(2024, 0, 1) }),
		]);

		const posts = await getSortedPosts();
		expect(posts.map((p) => p.id)).toEqual(["new", "old"]);
	});
});

describe("getPostUrl", () => {
	it("builds the canonical /posts/ path with trailing slash", () => {
		expect(getPostUrl(makePost("my-post"))).toBe("/posts/my-post/");
	});

	it("keeps multi-segment ids intact", () => {
		expect(getPostUrl(makePost("oldperl/some-post"))).toBe("/posts/oldperl/some-post/");
	});
});

describe("getPostDisplayDate", () => {
	it("prefers updatedDate when present", () => {
		const updated = new Date(2024, 5, 1);
		expect(getPostDisplayDate(makePost("a", { updatedDate: updated }))).toBe(updated);
	});

	it("falls back to publishDate", () => {
		const published = new Date(2024, 0, 1);
		expect(getPostDisplayDate(makePost("a", { publishDate: published }))).toBe(published);
	});
});

describe("getPostSortDate", () => {
	const post = makePost("a", {
		publishDate: new Date(2024, 0, 1),
		updatedDate: new Date(2024, 5, 1),
	});

	it("uses publishDate when sortPostsByUpdatedDate is off", () => {
		expect(getPostSortDate(post).getMonth()).toBe(0);
	});

	it("uses updatedDate when sortPostsByUpdatedDate is on", () => {
		siteConfig.sortPostsByUpdatedDate = true;
		expect(getPostSortDate(post).getMonth()).toBe(5);
	});

	it("falls back to publishDate when the option is on but no updatedDate exists", () => {
		siteConfig.sortPostsByUpdatedDate = true;
		expect(getPostSortDate(makePost("b", { publishDate: new Date(2024, 0, 1) })).getMonth()).toBe(
			0,
		);
	});
});

describe("sortMDByDate", () => {
	it("sorts descending by sort date", () => {
		const posts = [
			makePost("mid", { publishDate: new Date(2022, 0, 1) }),
			makePost("new", { publishDate: new Date(2024, 0, 1) }),
			makePost("old", { publishDate: new Date(2020, 0, 1) }),
		];
		expect(sortMDByDate(posts).map((p) => p.id)).toEqual(["new", "mid", "old"]);
	});
});

describe("groupPostsByYear", () => {
	it("groups posts under their sort-date year", () => {
		const grouped = groupPostsByYear([
			makePost("a", { publishDate: new Date(2024, 0, 1) }),
			makePost("b", { publishDate: new Date(2024, 6, 1) }),
			makePost("c", { publishDate: new Date(2020, 0, 1) }),
		]);
		expect(Object.keys(grouped).sort()).toEqual(["2020", "2024"]);
		expect(grouped["2024"]).toHaveLength(2);
	});
});

describe("tag helpers", () => {
	const posts = [
		makePost("a", { tags: ["perl", "sql"] }),
		makePost("b", { tags: ["perl"] }),
		makePost("c", { tags: [] }),
	];

	it("getAllTags keeps duplicates", () => {
		expect(getAllTags(posts)).toEqual(["perl", "sql", "perl"]);
	});

	it("getUniqueTags dedupes", () => {
		expect(getUniqueTags(posts)).toEqual(["perl", "sql"]);
	});

	it("getUniqueTagsWithCount counts and sorts by frequency", () => {
		expect(getUniqueTagsWithCount(posts)).toEqual([
			["perl", 2],
			["sql", 1],
		]);
	});
});
