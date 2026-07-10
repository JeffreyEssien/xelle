describe("Admin Login", () => {
    beforeEach(() => {
        cy.visit("/admin/login");
    });

    it("displays the login form", () => {
        cy.contains("Admin Access").should("be.visible");
        cy.get('input[id="email"]').should("be.visible");
        cy.get('input[id="password"]').should("be.visible");
        cy.contains("button", "Sign In").should("be.visible");
    });

    it("email field is focused on load", () => {
        cy.get('input[id="email"]').should("have.focus");
    });

    it("shows error for wrong credentials", () => {
        cy.get('input[id="email"]').type("nobody@example.com");
        cy.get('input[id="password"]').type("wrongpassword");
        cy.contains("button", "Sign In").click();

        // Should show an error message
        cy.contains(/invalid|incorrect|wrong|denied/i, { timeout: 10000 }).should("be.visible");
    });

    it("shows a loading state while authenticating", () => {
        // Delay the login response so the transient loading state is observable.
        cy.intercept("POST", "/api/admin/login", (req) => {
            req.on("response", (res) => {
                res.setDelay(600);
            });
        }).as("login");

        cy.get('input[id="email"]').type("nobody@example.com");
        cy.get('input[id="password"]').type("somepassword");
        cy.contains("button", "Sign In").click();

        cy.contains("button", /signing in/i).should("be.visible");
        cy.wait("@login");
    });
});
