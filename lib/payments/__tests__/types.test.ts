import { describe, it, expect } from "vitest";
import { normalizeCameroonPhone, isMtnNumber, isOrangeNumber } from "@/lib/payments/types";

describe("normalizeCameroonPhone", () => {
  it("adds the country code to a bare 9-digit local number", () => {
    expect(normalizeCameroonPhone("677123456")).toBe("237677123456");
  });

  it("leaves an already-prefixed number untouched", () => {
    expect(normalizeCameroonPhone("237677123456")).toBe("237677123456");
  });

  it("strips spaces and punctuation before normalizing", () => {
    expect(normalizeCameroonPhone("677 123 456")).toBe("237677123456");
    expect(normalizeCameroonPhone("+237 677-123-456")).toBe("237677123456");
  });
});

describe("isMtnNumber", () => {
  it("recognizes common MTN Cameroon prefixes", () => {
    expect(isMtnNumber("677123456")).toBe(true);
    expect(isMtnNumber("680123456")).toBe(true);
    expect(isMtnNumber("650123456")).toBe(true);
  });

  it("rejects non-MTN prefixes", () => {
    expect(isMtnNumber("699123456")).toBe(false);
  });
});

describe("isOrangeNumber", () => {
  it("recognizes common Orange Cameroon prefixes", () => {
    expect(isOrangeNumber("699123456")).toBe(true);
    expect(isOrangeNumber("655123456")).toBe(true);
  });

  it("rejects non-Orange prefixes", () => {
    expect(isOrangeNumber("677123456")).toBe(false);
  });
});
