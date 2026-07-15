// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

import { elementHasClass, rootInDarkMode, toggleClass } from "./domElement";

describe("toggleClass / elementHasClass", () => {
	it("adds the class when absent and removes it when present", () => {
		const el = document.createElement("div");

		toggleClass(el, "menu-open");
		expect(elementHasClass(el, "menu-open")).toBe(true);

		toggleClass(el, "menu-open");
		expect(elementHasClass(el, "menu-open")).toBe(false);
	});
});

describe("rootInDarkMode", () => {
	beforeEach(() => {
		document.documentElement.removeAttribute("data-theme");
	});

	it("is true only when <html data-theme='dark'>", () => {
		expect(rootInDarkMode()).toBe(false);

		document.documentElement.setAttribute("data-theme", "light");
		expect(rootInDarkMode()).toBe(false);

		document.documentElement.setAttribute("data-theme", "dark");
		expect(rootInDarkMode()).toBe(true);
	});
});
