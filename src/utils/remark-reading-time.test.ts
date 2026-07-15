import { describe, expect, it } from "vitest";

import { remarkReadingTime } from "./remark-reading-time";

function mdastWithWords(wordCount: number) {
	return {
		children: [
			{
				children: [{ type: "text", value: "word ".repeat(wordCount).trim() }],
				type: "paragraph",
			},
		],
		type: "root",
	};
}

describe("remarkReadingTime", () => {
	it("writes minutesRead into the astro frontmatter", () => {
		const transformer = remarkReadingTime() as (tree: unknown, file: unknown) => void;
		const file = { data: { astro: { frontmatter: {} as Record<string, unknown> } } };

		transformer(mdastWithWords(400), file);

		// reading-time defaults to 200 wpm → 400 words ≈ 2 min
		expect(file.data.astro.frontmatter.minutesRead).toBe("2 min read");
	});

	it("reports at least a 1 minute read for short posts", () => {
		const transformer = remarkReadingTime() as (tree: unknown, file: unknown) => void;
		const file = { data: { astro: { frontmatter: {} as Record<string, unknown> } } };

		transformer(mdastWithWords(10), file);

		expect(file.data.astro.frontmatter.minutesRead).toBe("1 min read");
	});
});
