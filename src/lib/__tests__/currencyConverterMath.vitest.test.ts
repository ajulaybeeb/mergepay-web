import { describe, it, expect } from "vitest";
import { convertAmount, aggregateMixedAmounts, getPairKey, normalizeAssetCode } from "@/lib/exchange";

describe("Currency Conversion Math & Precision", () => {
  const mockRates = {
    "XLM-USDC": 0.12,
    "USDC-XLM": 8.3333333,
    "USD-USDC": 1.0,
    "USDC-USD": 1.0,
    "EUR-USD": 1.09,
    "USD-EUR": 0.9174311,
    "GBP-USD": 1.27,
  };

  it("normalizes asset codes and pair keys", () => {
    expect(normalizeAssetCode("  xlm ")).toBe("XLM");
    expect(getPairKey("xlm", "usdc")).toBe("XLM-USDC");
  });

  it("converts identical assets directly without loss", () => {
    expect(convertAmount("100.5000000", "USDC", "USDC", mockRates)).toBe("100.5000000");
    expect(convertAmount("50", "XLM", "XLM", mockRates)).toBe("50.0000000");
  });

  it("converts cross-asset values using canonical rates", () => {
    const converted = convertAmount("100", "XLM", "USDC", mockRates);
    expect(converted).not.toBeNull();
    // 100 * 0.12 = 12 USDC
    expect(parseFloat(converted!)).toBeCloseTo(12.0, 4);
  });

  it("aggregates mixed asset amounts into a common target asset", () => {
    const items = [
      { amount: "100", assetCode: "XLM" }, // 12 USDC
      { amount: "50", assetCode: "USDC" }, // 50 USDC
    ];

    const totalUsdc = aggregateMixedAmounts(items, "USDC", mockRates);
    expect(parseFloat(totalUsdc)).toBeCloseTo(62.0, 2);
  });

  it("handles zero, negative, and invalid values gracefully", () => {
    expect(convertAmount("0", "XLM", "USDC", mockRates)).toBe("0.0000000");
    expect(convertAmount("-10", "XLM", "USDC", mockRates)).toBeNull();
    expect(convertAmount("not-a-number", "XLM", "USDC", mockRates)).toBeNull();
    expect(convertAmount("10", "UNKNOWN", "USDC", mockRates)).toBeNull();
  });
});
