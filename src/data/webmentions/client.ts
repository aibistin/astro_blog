import type { WebmentionsFeed } from "@/types";

interface ClientEnv {
	apiToken?: string;
	domain?: string;
}

/**
 * Calls the webmention.io API for mentions of this site, optionally only those
 * since `timeFrom`. Credentials default to the build environment but are
 * injectable for tests (Astro statically replaces import.meta.env at build time).
 */
export async function fetchWebmentions(
	timeFrom: null | string,
	perPage = 1000,
	{ apiToken = import.meta.env.WEBMENTION_API_KEY, domain = import.meta.env.SITE }: ClientEnv = {},
) {
	if (!domain) {
		console.warn("No domain specified. Please set in astro.config.ts");
		return null;
	}

	if (!apiToken) {
		console.warn("No webmention api token specified in .env");
		return null;
	}

	const hostName = new URL(domain).hostname;
	let url = `https://webmention.io/api/mentions.jf2?domain=${hostName}&token=${apiToken}&sort-dir=up&per-page=${perPage}`;

	if (timeFrom) url += `&since=${timeFrom}`;

	const res = await fetch(url);

	if (res.ok) {
		return (await res.json()) as WebmentionsFeed;
	}

	return null;
}
