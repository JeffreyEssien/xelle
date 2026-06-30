import { describe, it, expect } from "vitest";
import {
    SITE_NAME,
    CURRENCY,
    LOW_STOCK_THRESHOLD,
    NAV_LINKS,
    ADMIN_NAV_LINKS,
    WHATSAPP_NUMBER,
    BANK_NAME,
    BANK_ACCOUNT_NUMBER,
    BANK_ACCOUNT_NAME,
} from "@/lib/constants";

describe("Site constants", () => {
    it("has correct site name", () => {
        expect(SITE_NAME).toBe("XELLÉ");
    });

    it("uses NGN currency", () => {
        expect(CURRENCY).toBe("NGN");
    });

    it("has a low stock threshold of 5", () => {
        expect(LOW_STOCK_THRESHOLD).toBe(5);
    });

    it("has navigation links with correct structure", () => {
        expect(NAV_LINKS.length).toBeGreaterThan(0);
        for (const link of NAV_LINKS) {
            expect(link).toHaveProperty("label");
            expect(link).toHaveProperty("href");
            expect(link.href).toMatch(/^\//);
        }
    });

    it("has admin navigation links", () => {
        expect(ADMIN_NAV_LINKS.length).toBeGreaterThan(0);
        for (const link of ADMIN_NAV_LINKS) {
            expect(link.href).toMatch(/^\/admin/);
        }
    });

    it("has valid WhatsApp number", () => {
        expect(WHATSAPP_NUMBER).toMatch(/^234\d+$/);
    });

    it("has bank details", () => {
        expect(BANK_NAME).toBeTruthy();
        expect(BANK_ACCOUNT_NUMBER).toBeTruthy();
        expect(BANK_ACCOUNT_NAME).toBeTruthy();
    });
});
