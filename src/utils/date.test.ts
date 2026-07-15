import { describe, expect, it } from "vitest";

import { getFormattedDate } from "./date";

// local-time Date avoids UTC/local timezone off-by-one in assertions
const jan15 = new Date(2024, 0, 15);

describe("getFormattedDate", () => {
	it("formats with the site default locale and options", () => {
		expect(getFormattedDate(jan15)).toBe("Jan 15, 2024");
	});

	it("accepts a date string", () => {
		expect(getFormattedDate(jan15.toISOString())).toBe("Jan 15, 2024");
	});

	it("accepts a timestamp number", () => {
		expect(getFormattedDate(jan15.valueOf())).toBe("Jan 15, 2024");
	});

	it("merges caller options over the site defaults", () => {
		expect(getFormattedDate(jan15, { month: "long" })).toBe("January 15, 2024");
	});

	it("caller options can drop parts of the default format", () => {
		expect(getFormattedDate(jan15, { day: undefined, month: "long", year: undefined })).toBe(
			"January",
		);
	});
});
