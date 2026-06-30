describe("Admin Login", () => {
    beforeEach(() => {
        cy.visit("/admin/login");
    });

    it("displays the login form", () => {
        cy.contains("XELLÉ").should("be.visible");
        cy.contains("Admin Access").should("be.visible");
        cy.get('input[id="password"]').should("be.visible");
        cy.contains("button", "Sign In").should("be.visible");
    });

    it("password field is focused on load", () => {
        cy.get('input[id="password"]').should("have.focus");
    });

    it("shows error for wrong password", () => {
        cy.get('input[id="password"]').type("wrongpassword");
        cy.contains("button", "Sign In").click();

        // Should show error message
        cy.contains(/invalid|incorrect|wrong|denied/i, { timeout: 10000 }).should("be.visible");
    });

    it("disables button while authenticating", () => {
        cy.get('input[id="password"]').type("somepassword");
        cy.contains("button", "Sign In").click();

        // Button should show loading state briefly
        cy.contains("button", /signing in/i).should("exist");
    });
});
