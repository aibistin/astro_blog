import * as fs from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * URL-parity regression pin for the Content Layer migration.
 *
 * The glob loader's default ID generation must keep producing the same IDs the
 * legacy content-collections API produced, or public post URLs silently change.
 * `npm test` runs `astro sync` first, which writes the content store this reads.
 */
describe("post IDs (public URL parity)", () => {
	const storePath = ".astro/data-store.json";

	it("preserves the known post IDs", () => {
		expect(fs.existsSync(storePath), `${storePath} missing — run \`astro sync\` first`).toBe(true);
		const store = fs.readFileSync(storePath, "utf-8");

		const expectedIds = [
			// frontmatter slug: overrides (oldperl/*)
			"multiple-forms-with-html-form-handler",
			"upload-photo-perl-dancer-bootstrap",
			"deploying-to-dot-cloud",
			"truck-traveltime-calculator-perl-google-matrix",
			// <dir>/index.md → directory name
			"cover-image",
			// plain filename (underscores preserved)
			"0010_nyc_covid_data_with_python",
		];

		for (const id of expectedIds) {
			expect(store, `expected post id "${id}" in content store`).toContain(`"${id}"`);
		}
	});
});
