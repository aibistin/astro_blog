import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchWebmentions } from "./client";

const env = { apiToken: "test-token", domain: "https://aibistin.com/" };
const feed = { children: [], name: "feed", type: "feed" };

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
	fetchMock.mockReset();
	vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("fetchWebmentions", () => {
	it("returns null and warns when no domain is configured", async () => {
		expect(await fetchWebmentions(null, 1000, { ...env, domain: "" })).toBeNull();
		expect(console.warn).toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns null and warns when no api token is configured", async () => {
		expect(await fetchWebmentions(null, 1000, { ...env, apiToken: "" })).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("queries webmention.io for the site hostname", async () => {
		fetchMock.mockResolvedValue({ json: () => Promise.resolve(feed), ok: true });

		expect(await fetchWebmentions(null, 500, env)).toEqual(feed);

		const url = fetchMock.mock.calls[0]?.[0] as string;
		expect(url).toContain("domain=aibistin.com");
		expect(url).toContain("token=test-token");
		expect(url).toContain("per-page=500");
		expect(url).not.toContain("since");
	});

	it("passes the since parameter for incremental fetches", async () => {
		fetchMock.mockResolvedValue({ json: () => Promise.resolve(feed), ok: true });

		await fetchWebmentions("2024-01-01T00:00:00Z", 1000, env);

		expect(fetchMock.mock.calls[0]?.[0]).toContain("&since=2024-01-01T00:00:00Z");
	});

	it("returns null on a non-ok response", async () => {
		fetchMock.mockResolvedValue({ ok: false });

		expect(await fetchWebmentions(null, 1000, env)).toBeNull();
	});
});
