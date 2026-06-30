import { E2E_EMAIL } from "../../scripts/e2e-markers.mjs";

describe("Checkout Page", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it("redirects to shop if cart is empty", () => {
        cy.visit("/checkout");
        // Should either show empty state or redirect
        cy.url().then((url) => {
            if (url.includes("/checkout")) {
                // If stays on checkout, should show empty cart message or redirect button
                cy.contains(/empty|no items|start shopping|shop/i).should("be.visible");
            }
        });
    });

    it("displays checkout form with items in cart", () => {
        // Add item to cart first
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        cy.visit("/checkout");
        // Form fields should be visible
        cy.get('input[name="firstName"]').should("be.visible");
        cy.get('input[name="lastName"]').should("be.visible");
        cy.get('input[name="email"]').should("be.visible");
        cy.get('input[name="phone"]').should("be.visible");
    });

    it("validates required fields", () => {
        // Add item to cart
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        cy.visit("/checkout");

        // Try to submit without filling fields
        cy.contains("button", /place order|pay|submit|checkout/i).click();

        // Should show custom "Required" validation errors
        cy.contains("Required").should("be.visible");
    });

    it("can fill out the checkout form", () => {
        // Add item to cart
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        cy.visit("/checkout");

        cy.get('input[name="firstName"]').type("E2E");
        cy.get('input[name="lastName"]').type("Test");
        // Tagged email so any order this flow creates is removable by cleanup-e2e.
        cy.get('input[name="email"]').type(E2E_EMAIL);
        cy.get('input[name="phone"]').type("08012345678");
        cy.get('input[name="address"]').type("123 Test Street, Lekki");

        // Select state
        cy.get("select").first().select("Lagos");
    });

    it("shows delivery fee after selecting location", () => {
        // Add item to cart
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        cy.visit("/checkout");

        // Select Lagos
        cy.get("select").first().select("Lagos");

        // Should show Lagos area picker and delivery fee
        cy.contains(/delivery|shipping/i).should("be.visible");
    });

    it("shows order summary with totals", () => {
        // Add item to cart
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        cy.visit("/checkout");

        // Order summary should show subtotal and total
        cy.contains(/subtotal/i).should("be.visible");
        cy.contains(/total/i).should("be.visible");
        cy.contains("₦").should("be.visible");
    });
});
