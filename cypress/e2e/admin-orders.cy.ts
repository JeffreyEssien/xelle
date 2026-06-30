describe("Admin Orders Management", () => {
    beforeEach(() => {
        const password = Cypress.env("ADMIN_PASSWORD");
        if (!password) {
            cy.log("Skipping: ADMIN_PASSWORD not set");
            return;
        }
        cy.adminLogin(password);
        cy.contains("a", "Orders").click();
        cy.url().should("include", "/admin/orders");
    });

    it("displays the orders page", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.contains("Orders").should("be.visible");
    });

    it("has search functionality", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.get('input[placeholder*="Search" i]').should("be.visible");
    });

    it("has filter tabs", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.contains(/all orders/i).should("be.visible");
    });

    it("can search for orders", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.get('input[placeholder*="Search" i]').type("ORD-");
        cy.wait(500); // Debounce
    });

    it("has a create order button", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.contains("button", /create order/i).should("be.visible");
    });
});
