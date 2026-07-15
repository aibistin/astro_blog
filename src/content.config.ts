import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import { postSchema } from "./content/schema";

/**
 * The glob loader's default ID generation matches the legacy content-collection
 * slug rules exactly (frontmatter `slug` override → folder name for index.md →
 * slugified filename), so existing post URLs are preserved without a custom
 * generateId. Pinned by src/data/post-ids.test.ts.
 */
const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/[^_]*.{md,mdx}" }),
	schema: postSchema,
});

export const collections = { post };
