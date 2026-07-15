import type { WebmentionsCache } from "@/types";

import * as fs from "node:fs/promises";

const CACHE_DIR = ".data";
const CACHE_FILE = `${CACHE_DIR}/webmentions.json`;

/** persist merged webmentions between builds so each build only fetches new ones */
export async function writeToCache(data: WebmentionsCache) {
	try {
		await fs.mkdir(CACHE_DIR, { recursive: true });
		await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
		console.log(`Webmentions saved to ${CACHE_FILE}`);
	} catch (err) {
		// a failed cache write should never fail the build — next build refetches
		console.error(`Failed to write webmentions cache: ${err}`);
	}
}

export async function getFromCache(): Promise<WebmentionsCache> {
	try {
		const data = await fs.readFile(CACHE_FILE, "utf-8");
		return JSON.parse(data);
	} catch {
		// no cache found (or unreadable) — start fresh
		return { children: [], lastFetched: null };
	}
}
