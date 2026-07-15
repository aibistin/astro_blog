import type { PaginationLink } from "@/types";

interface PaginationLabels {
	next?: string;
	prev?: string;
}

/** Builds Paginator props from an Astro Page.url object plus page-specific labels. */
export function buildPaginationProps(
	url: { next?: string; prev?: string },
	labels: PaginationLabels = {},
): { nextUrl?: PaginationLink; prevUrl?: PaginationLink } {
	const { next = "Next", prev = "Previous" } = labels;
	return {
		...(url.prev && { prevUrl: { text: prev, url: url.prev } }),
		...(url.next && { nextUrl: { text: next, url: url.next } }),
	};
}
