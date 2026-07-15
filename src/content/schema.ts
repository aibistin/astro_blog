import type { ImageFunction } from "astro:content";

import { z } from "astro/zod";

/** Lowercases tags and removes duplicates so /tags/[tag] routes stay consistent. */
export function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

/**
 * Frontmatter schema for the `post` collection.
 * Written as a factory so Astro can inject its image() helper at build time
 * and unit tests can stub it (see schema.test.ts).
 */
export function postSchema({ image }: { image: ImageFunction }) {
	return z.object({
		coverImage: z
			.object({
				alt: z.string(),
				src: image(),
			})
			.optional(),
		description: z.string().min(50).max(160),
		draft: z.boolean().default(false),
		ogImage: z.string().optional(),
		publishDate: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		title: z.string().max(80),
		updatedDate: z
			.string()
			.optional()
			.transform((str) => (str ? new Date(str) : undefined)),
	});
}
