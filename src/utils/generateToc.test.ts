import type { MarkdownHeading } from "astro";

import { describe, expect, it } from "vitest";

import { generateToc } from "./generateToc";

function h(depth: number, text: string): MarkdownHeading {
	return { depth, slug: text.toLowerCase().replaceAll(" ", "-"), text };
}

describe("generateToc", () => {
	it("returns an empty toc for no headings", () => {
		expect(generateToc([])).toEqual([]);
	});

	it("ignores h1 headings", () => {
		expect(generateToc([h(1, "Title")])).toEqual([]);
	});

	it("puts h2 headings at the top level", () => {
		const toc = generateToc([h(2, "One"), h(2, "Two")]);
		expect(toc.map((t) => t.text)).toEqual(["One", "Two"]);
		expect(toc[0]?.subheadings).toEqual([]);
	});

	it("nests h3 under the preceding h2", () => {
		const toc = generateToc([h(2, "Parent"), h(3, "Child"), h(3, "Child Two")]);
		expect(toc).toHaveLength(1);
		expect(toc[0]?.subheadings.map((s) => s.text)).toEqual(["Child", "Child Two"]);
	});

	it("nests an h4 that skips a level under the last h2", () => {
		const toc = generateToc([h(2, "Parent"), h(4, "Deep")]);
		expect(toc[0]?.subheadings.map((s) => s.text)).toEqual(["Deep"]);
	});

	it("nests h4 under h3 under h2", () => {
		const toc = generateToc([h(2, "A"), h(3, "B"), h(4, "C")]);
		expect(toc[0]?.subheadings[0]?.subheadings.map((s) => s.text)).toEqual(["C"]);
	});

	it("treats a leading h3 (no h2 yet) as top-level instead of crashing", () => {
		const toc = generateToc([h(3, "Leading"), h(2, "Later")]);
		expect(toc.map((t) => t.text)).toEqual(["Leading", "Later"]);
	});

	it("throws on an orphan heading shallower than the current top-level item", () => {
		expect(() => generateToc([h(4, "Deep First"), h(3, "Orphan")])).toThrow(/Orphan heading/);
	});
});
