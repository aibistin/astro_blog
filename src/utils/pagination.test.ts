import { describe, expect, it } from "vitest";

import { buildPaginationProps } from "./pagination";

describe("buildPaginationProps", () => {
	it("returns no links for a single page", () => {
		expect(buildPaginationProps({})).toEqual({});
	});

	it("returns only prevUrl on the last page", () => {
		expect(buildPaginationProps({ prev: "/posts/1/" })).toEqual({
			prevUrl: { text: "Previous", url: "/posts/1/" },
		});
	});

	it("returns only nextUrl on the first page", () => {
		expect(buildPaginationProps({ next: "/posts/2/" })).toEqual({
			nextUrl: { text: "Next", url: "/posts/2/" },
		});
	});

	it("returns both links with custom labels", () => {
		expect(
			buildPaginationProps(
				{ next: "/posts/3/", prev: "/posts/1/" },
				{ next: "Next Posts →", prev: "← Previous Posts" },
			),
		).toEqual({
			nextUrl: { text: "Next Posts →", url: "/posts/3/" },
			prevUrl: { text: "← Previous Posts", url: "/posts/1/" },
		});
	});
});
