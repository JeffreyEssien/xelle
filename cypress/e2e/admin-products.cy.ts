describe("Admin Products Management", () => {
    beforeEach(() => {
        const password = Cypress.env("ADMIN_PASSWORD");
        if (!password) {
            cy.log("Skipping: ADMIN_PASSWORD not set");
            return;
        }
        cy.adminLogin(password);
        cy.contains("a", "Products").click();
        cy.url().should("include", "/admin/products");
    });

    it("displays the products page", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.contains("Products").should("be.visible");
    });

    it("has search functionality", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.get('input[placeholder*="Search" i]').should("be.visible");
    });

    it("has an add product button", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.contains("button", /add product/i).should("be.visible");
    });

    it("displays product list", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        // Should show product names and prices
        cy.contains("₦").should("be.visible");
    });

    it("can search for products", () => {
        if (!Cypress.env("ADMIN_PASSWORD")) return;
        cy.get('input[placeholder*="Search" i]').type("test");
        cy.wait(500); // Debounce
    });
});
