/// <reference types="cypress" />

// Add custom commands here

Cypress.Commands.add("adminLogin", (password?: string) => {
    cy.visit("/admin/login");
    cy.get('input[id="password"]').type(password ?? Cypress.env("ADMIN_PASSWORD") ?? "admin");
    cy.contains("button", "Sign In").click();
    cy.url().should("include", "/admin");
    cy.url().should("not.include", "/login");
});

declare global {
    namespace Cypress {
        interface Chainable {
            adminLogin(password?: string): Chainable<void>;
        }
    }
}

export {};
