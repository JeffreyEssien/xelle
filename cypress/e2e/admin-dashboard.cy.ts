describe("Admin Dashboard", () => {
    // Note: These tests require a valid ADMIN_PASSWORD env var
    // Set via: CYPRESS_ADMIN_PASSWORD=yourpass npx cypress run

    it("redirects to login when not authenticated", () => {
        cy.visit("/admin");
        // Should redirect to login
        cy.url().should("include", "/login");
    });

    // The tests below require authentication.
    // They will pass when CYPRESS_ADMIN_PASSWORD is set correctly.
    describe("when authenticated", () => {
        beforeEach(() => {
            // Skip if no admin password configured
            const password = Cypress.env("ADMIN_PASSWORD");
            if (!password) {
                cy.log("Skipping: ADMIN_PASSWORD not set");
                return;
            }
            cy.adminLogin(password);
        });

        it("shows the admin dashboard", () => {
            if (!Cypress.env("ADMIN_PASSWORD")) return;
            cy.url().should("match", /\/admin$/);
        });

        it("has sidebar navigation", () => {
            if (!Cypress.env("ADMIN_PASSWORD")) return;
            cy.contains("a", "Products").should("be.visible");
            cy.contains("a", "Orders").should("be.visible");
            cy.contains("a", "Stockpiles").should("be.visible");
            cy.contains("a", "Customers").should("be.visible");
        });

        it("can navigate to orders page", () => {
            if (!Cypress.env("ADMIN_PASSWORD")) return;
            cy.contains("a", "Orders").click();
            cy.url().should("include", "/admin/orders");
            cy.contains("Orders").should("be.visible");
        });

        it("can navigate to products page", () => {
            if (!Cypress.env("ADMIN_PASSWORD")) return;
            cy.contains("a", "Products").click();
            cy.url().should("include", "/admin/products");
            cy.contains("Products").should("be.visible");
        });
    });
});
