import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/formatCurrency";

describe("formatCurrency", () => {
    it("formats a whole number", () => {
        const result = formatCurrency(5000);
        expect(result).toContain("5,000");
        // Intl formats NGN with ₦ symbol
        expect(result).toContain("₦");
    });

    it("formats zero", () => {
        const result = formatCurrency(0);
        expect(result).toContain("0");
    });

    it("formats decimal amounts", () => {
        const result = formatCurrency(1234.56);
        expect(result).toContain("1,234");
    });

    it("formats large amounts", () => {
        const result = formatCurrency(1000000);
        expect(result).toContain("1,000,000");
    });

    it("formats negative amounts", () => {
        const result = formatCurrency(-500);
        expect(result).toContain("500");
    });
});
