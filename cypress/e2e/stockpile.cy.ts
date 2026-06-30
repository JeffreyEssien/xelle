describe("Stockpile Page", () => {
    beforeEach(() => {
        cy.visit("/stockpile");
    });

    it("displays the stockpile search form", () => {
        cy.get('input[placeholder*="email" i], input[placeholder*="stockpile" i]').should(
            "be.visible"
        );
    });

    it("explains how stockpile works", () => {
        // Should have explainer content
        cy.contains(/stockpile|pay now|ship later/i).should("be.visible");
    });

    it("can search by email", () => {
        cy.get('input[placeholder*="email" i], input[placeholder*="stockpile" i]')
            .first()
            .type("test@example.com");
        cy.contains("button", /find|search/i).click();

        // Should show result or "not found" message
        cy.contains(/stockpile|not found|no active/i, { timeout: 10000 }).should("be.visible");
    });

    it("shows no stockpile message for unknown email", () => {
        cy.get('input[placeholder*="email" i], input[placeholder*="stockpile" i]')
            .first()
            .type("nonexistent@nowhere.com");
        cy.contains("button", /find|search/i).click();

        cy.contains(/no active stockpile|not found/i, { timeout: 10000 }).should("be.visible");
    });
});
