import type { ImageFunction } from "astro:content";

import { z } from "astro/zod";
import { describe, expect, it } from "vitest";

import { postSchema, removeDupsAndLowerCase } from "./schema";

// stand-in for Astro's build-time image() helper
const stubImage = (() => z.string()) as unknown as ImageFunction;
const schema = postSchema({ image: stubImage });

const validPost = {
	description: "A description that is comfortably longer than the fifty character minimum.",
	publishDate: "2024-03-01",
	title: "A valid title",
};

describe("removeDupsAndLowerCase", () => {
	it("passes an empty array through", () => {
		expect(removeDupsAndLowerCase([])).toEqual([]);
	});

	it("lowercases and dedupes case-insensitively", () => {
		expect(removeDupsAndLowerCase(["Perl", "perl", "SQL"])).toEqual(["perl", "sql"]);
	});
});

describe("postSchema", () => {
	it("accepts a minimal valid post and applies defaults", () => {
		const parsed = schema.parse(validPost);
		expect(parsed.draft).toBe(false);
		expect(parsed.tags).toEqual([]);
		expect(parsed.publishDate).toBeInstanceOf(Date);
		expect(parsed.updatedDate).toBeUndefined();
	});

	it("coerces publishDate strings and Date objects", () => {
		expect(schema.parse(validPost).publishDate.getFullYear()).toBe(2024);
		expect(
			schema.parse({ ...validPost, publishDate: new Date(2023, 5, 1) }).publishDate.getFullYear(),
		).toBe(2023);
	});

	it("coerces updatedDate when present", () => {
		const parsed = schema.parse({ ...validPost, updatedDate: "2024-04-01" });
		expect(parsed.updatedDate).toBeInstanceOf(Date);
	});

	it("lowercases and dedupes tags", () => {
		const parsed = schema.parse({ ...validPost, tags: ["Astro", "astro", "Testing"] });
		expect(parsed.tags).toEqual(["astro", "testing"]);
	});

	it("rejects a too-short description", () => {
		expect(schema.safeParse({ ...validPost, description: "too short" }).success).toBe(false);
	});

	it("rejects a too-long description", () => {
		expect(schema.safeParse({ ...validPost, description: "x".repeat(161) }).success).toBe(false);
	});

	it("rejects a title over 80 characters", () => {
		expect(schema.safeParse({ ...validPost, title: "x".repeat(81) }).success).toBe(false);
	});
});
