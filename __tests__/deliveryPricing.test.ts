import { describe, it, expect } from "vitest";
import {
    isLagos,
    lookupLagosZone,
    fuzzyMatchLagosArea,
    getAllLagosAreas,
    hasInterstatePricing,
    getInterstateState,
    getInterstateFee,
    applyDiscount,
    LAGOS_ZONES,
    INTERSTATE_DATA,
    NIGERIAN_STATES,
    EXTRA_WEIGHT_PER_KG,
    BASE_WEIGHT_KG,
    REMOTE_AREA_SURCHARGE,
} from "@/lib/deliveryPricing";

describe("isLagos", () => {
    it("returns true for Lagos (case-insensitive)", () => {
        expect(isLagos("Lagos")).toBe(true);
        expect(isLagos("lagos")).toBe(true);
        expect(isLagos("LAGOS")).toBe(true);
    });

    it("returns false for other states", () => {
        expect(isLagos("Ogun")).toBe(false);
        expect(isLagos("Abuja")).toBe(false);
    });
});

describe("lookupLagosZone", () => {
    it("finds a known area (case-insensitive)", () => {
        const zone = lookupLagosZone("Ikate");
        expect(zone).not.toBeNull();
        expect(zone!.key).toBe("island_core");
        expect(zone!.fee).toBe(3500);
    });

    it("handles lowercase input", () => {
        const zone = lookupLagosZone("surulere");
        expect(zone).not.toBeNull();
        expect(zone!.key).toBe("mainland_core");
    });

    it("returns null for unknown area", () => {
        expect(lookupLagosZone("Unknown Place")).toBeNull();
    });
});

describe("fuzzyMatchLagosArea", () => {
    it("exact match", () => {
        const match = fuzzyMatchLagosArea("Ikate");
        expect(match).not.toBeNull();
        expect(match!.area).toBe("Ikate");
    });

    it("starts-with match", () => {
        const match = fuzzyMatchLagosArea("Lekki");
        expect(match).not.toBeNull();
        expect(match!.area).toBe("Lekki Phase 1");
    });

    it("contains match (vi → Victoria Island)", () => {
        const match = fuzzyMatchLagosArea("Victoria");
        expect(match).not.toBeNull();
        expect(match!.area).toContain("Victoria Island");
    });

    it("returns null for empty input", () => {
        expect(fuzzyMatchLagosArea("")).toBeNull();
        expect(fuzzyMatchLagosArea("   ")).toBeNull();
    });

    it("returns null for no match", () => {
        expect(fuzzyMatchLagosArea("Timbuktu")).toBeNull();
    });
});

describe("getAllLagosAreas", () => {
    it("returns all areas with zone info", () => {
        const areas = getAllLagosAreas();
        expect(areas.length).toBeGreaterThan(0);
        expect(areas[0]).toHaveProperty("area");
        expect(areas[0]).toHaveProperty("zone");
    });

    it("total areas matches sum of all zone areas", () => {
        const areas = getAllLagosAreas();
        const expectedTotal = LAGOS_ZONES.reduce((sum, z) => sum + z.areas.length, 0);
        expect(areas.length).toBe(expectedTotal);
    });
});

describe("Interstate pricing", () => {
    it("hasInterstatePricing returns true for covered states", () => {
        expect(hasInterstatePricing("Edo")).toBe(true);
        expect(hasInterstatePricing("edo")).toBe(true);
    });

    it("hasInterstatePricing returns false for uncovered states", () => {
        expect(hasInterstatePricing("Borno")).toBe(false);
    });

    it("getInterstateState returns correct data", () => {
        const data = getInterstateState("Delta");
        expect(data).not.toBeNull();
        expect(data!.state).toBe("Delta");
        expect(data!.cities.length).toBeGreaterThan(0);
    });

    it("getInterstateState returns null for unknown state", () => {
        expect(getInterstateState("Mars")).toBeNull();
    });

    it("getInterstateFee returns hub_pickup fee", () => {
        const fee = getInterstateFee("Oyo", "Ibadan", "hub_pickup");
        expect(fee).toBe(3500);
    });

    it("getInterstateFee returns doorstep fee", () => {
        const fee = getInterstateFee("Oyo", "Ibadan", "doorstep");
        expect(fee).toBe(6000);
    });

    it("getInterstateFee returns null for unknown city", () => {
        expect(getInterstateFee("Oyo", "Nonexistent", "hub_pickup")).toBeNull();
    });

    it("getInterstateFee returns null for unknown state", () => {
        expect(getInterstateFee("Mars", "City", "hub_pickup")).toBeNull();
    });
});

describe("applyDiscount", () => {
    it("applies a valid discount", () => {
        expect(applyDiscount(10000, 20)).toBe(8000);
    });

    it("returns original fee for 0% discount", () => {
        expect(applyDiscount(5000, 0)).toBe(5000);
    });

    it("returns original fee for negative discount", () => {
        expect(applyDiscount(5000, -10)).toBe(5000);
    });

    it("returns original fee for discount > 100", () => {
        expect(applyDiscount(5000, 150)).toBe(5000);
    });

    it("100% discount returns 0", () => {
        expect(applyDiscount(5000, 100)).toBe(0);
    });

    it("rounds the result", () => {
        expect(applyDiscount(1000, 33)).toBe(670);
    });
});

describe("constants", () => {
    it("has expected Lagos zones", () => {
        expect(LAGOS_ZONES).toHaveLength(4);
        const keys = LAGOS_ZONES.map((z) => z.key);
        expect(keys).toContain("island_core");
        expect(keys).toContain("mainland_extension");
    });

    it("has interstate data", () => {
        expect(INTERSTATE_DATA.length).toBeGreaterThan(0);
    });

    it("has Nigerian states list", () => {
        expect(NIGERIAN_STATES.length).toBe(37); // 36 states + FCT
    });

    it("has correct pricing constants", () => {
        expect(EXTRA_WEIGHT_PER_KG).toBe(1000);
        expect(BASE_WEIGHT_KG).toBe(2);
        expect(REMOTE_AREA_SURCHARGE).toBe(500);
    });
});
