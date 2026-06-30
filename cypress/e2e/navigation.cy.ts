describe("Site Navigation", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("loads the homepage", () => {
        cy.contains("XELLÉ").should("be.visible");
    });

    it("navigates to the shop page", () => {
        cy.contains("a", "Shop").click();
        cy.url().should("include", "/shop");
    });

    it("navigates to order tracking", () => {
        cy.contains("a", "Track Order").click();
        cy.url().should("include", "/track");
        cy.contains("Track Your Order").should("be.visible");
    });

    it("navigates to stockpile page", () => {
        cy.contains("a", "Stockpile").click();
        cy.url().should("include", "/stockpile");
    });

    it("opens and closes the cart drawer", () => {
        cy.get('button[aria-label="Open cart"]').click();
        cy.contains("Cart").should("be.visible");
    });
});
