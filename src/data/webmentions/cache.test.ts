import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
	mkdir: vi.fn(),
	readFile: vi.fn(),
	writeFile: vi.fn(),
}));

import * as fs from "node:fs/promises";

import { getFromCache, writeToCache } from "./cache";

const emptyCache = { children: [], lastFetched: null };

beforeEach(() => {
	vi.mocked(fs.mkdir).mockReset();
	vi.mocked(fs.readFile).mockReset();
	vi.mocked(fs.writeFile).mockReset();
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("getFromCache", () => {
	it("parses the cache file when present", async () => {
		const cached = { children: [], lastFetched: "2024-01-01T00:00:00Z" };
		vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(cached));

		expect(await getFromCache()).toEqual(cached);
	});

	it("returns an empty cache when the file is missing", async () => {
		vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT"));

		expect(await getFromCache()).toEqual(emptyCache);
	});
});

describe("writeToCache", () => {
	it("creates the cache dir and writes pretty-printed JSON", async () => {
		vi.mocked(fs.mkdir).mockResolvedValue(undefined);
		vi.mocked(fs.writeFile).mockResolvedValue(undefined);

		await writeToCache(emptyCache);

		expect(fs.mkdir).toHaveBeenCalledWith(".data", { recursive: true });
		expect(fs.writeFile).toHaveBeenCalledWith(
			".data/webmentions.json",
			JSON.stringify(emptyCache, null, 2),
		);
	});

	it("logs instead of throwing when the write fails", async () => {
		vi.mocked(fs.mkdir).mockResolvedValue(undefined);
		vi.mocked(fs.writeFile).mockRejectedValue(new Error("disk full"));

		await expect(writeToCache(emptyCache)).resolves.toBeUndefined();
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining("disk full"));
	});
});
