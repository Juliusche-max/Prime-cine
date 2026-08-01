import { describe, it, expect } from "vitest";
import { cn, slugify } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("resolves Tailwind conflicts, keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("text-bone", false, null, undefined, "text-prime")).toBe("text-prime");
  });

  it("applies conditional classes", () => {
    const active = true;
    expect(cn("base", active && "active")).toBe("base active");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Le Dernier Taxi")).toBe("le-dernier-taxi");
  });

  it("strips accents", () => {
    expect(slugify("Héritiers de Douala")).toBe("heritiers-de-douala");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Zéro   Couple!!")).toBe("zero-couple");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Amour à Kribi--  ")).toBe("amour-a-kribi");
  });

  it("handles empty input", () => {
    expect(slugify("")).toBe("");
  });
});
