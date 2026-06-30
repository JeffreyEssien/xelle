describe("Order Tracking", () => {
    beforeEach(() => {
        cy.visit("/track");
    });

    it("displays the tracking form", () => {
        cy.contains("Track Your Order").should("be.visible");
        cy.get('input[id="orderId"]').should("be.visible");
        cy.get('input[id="email"]').should("be.visible");
        cy.contains("button", "Track Order").should("be.visible");
    });

    it("validates required fields", () => {
        cy.contains("button", "Track Order").click();
        // Custom validation shows error message
        cy.contains(/please enter both/i).should("be.visible");
    });

    it("shows error for non-existent order", () => {
        cy.get('input[id="orderId"]').type("ORD-NONEXISTENT");
        cy.get('input[id="email"]').type("nobody@example.com");
        cy.contains("button", "Track Order").click();

        // Should show error message
        cy.contains(/not found|no order|error|couldn't find/i, { timeout: 10000 }).should(
            "be.visible"
        );
    });

    it("accepts order ID format", () => {
        cy.get('input[id="orderId"]').type("ORD-1234567890");
        cy.get('input[id="orderId"]').should("have.value", "ORD-1234567890");
    });
});
