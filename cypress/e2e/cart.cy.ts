describe("Cart", () => {
    beforeEach(() => {
        // Clear localStorage to reset cart
        cy.clearLocalStorage();
    });

    it("shows empty cart message", () => {
        cy.visit("/");
        // Open cart drawer
        cy.get('button[aria-label="Open cart"]').click();
        cy.contains(/your cart is empty/i).should("be.visible");
    });

    it("can add item and see it in cart", () => {
        // Visit a product and add to cart
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        // Open cart drawer
        cy.get('button[aria-label="Open cart"]').click();

        // Cart should have at least 1 item
        cy.contains("₦").should("be.visible");
        cy.contains("Checkout").should("be.visible");
    });

    it("can navigate to checkout from cart", () => {
        // Add a product first
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        // Open cart and go to checkout
        cy.get('button[aria-label="Open cart"]').click();
        cy.contains("a", "Checkout").click();
        cy.url().should("include", "/checkout");
    });

    it("can remove item from cart", () => {
        // Add a product
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();
        cy.contains("button", /add to cart/i).click();

        // Open cart
        cy.get('button[aria-label="Open cart"]').click();

        // Click the trash/remove button inside the cart drawer
        cy.get('aside li button').last().click();
        cy.contains(/your cart is empty/i).should("be.visible");
    });
});
