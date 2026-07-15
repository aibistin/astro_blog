/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Uses Astro's own Vite config so path aliases and astro:* virtual modules resolve.
export default getViteConfig({
	test: {
		coverage: {
			// 85% threshold applies to the unit-testable TS logic only —
			// .astro templates are exercised by `astro check` + the build.
			exclude: ["src/utils/index.ts", "src/**/*.test.ts"],
			include: ["src/utils/**", "src/data/**", "src/content/schema.ts"],
			provider: "v8",
			thresholds: { branches: 85, functions: 85, lines: 85, statements: 85 },
		},
		include: ["src/**/*.test.ts"],
	},
});
