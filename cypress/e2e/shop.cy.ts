describe("Shop Page", () => {
    beforeEach(() => {
        cy.visit("/shop");
    });

    it("displays products", () => {
        // Wait for products to load
        cy.get("a[href^='/product/']").should("have.length.at.least", 1);
    });

    it("shows product count", () => {
        cy.contains("product").should("be.visible");
    });

    it("can search for products via header search", () => {
        // Search is in the header — click the search icon first
        cy.get('button[aria-label="Search"]').click();
        cy.get('input[placeholder="Search products..."]').type("dress{enter}");
        cy.url().should("include", "q=dress");
    });

    it("can sort products", () => {
        // Open sort dropdown
        cy.contains("button", /featured|newest|price|name/i).click();
        cy.contains("Price: Low").click();
    });

    it("navigates to product detail page", () => {
        cy.get("a[href^='/product/']").first().click();
        cy.url().should("include", "/product/");
        // Product detail page should have an h1 with the product name
        cy.get("h1").should("be.visible");
    });
});

describe("Product Detail Page", () => {
    it("displays product information", () => {
        // Visit shop first and click first product
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();

        cy.get("h1").should("be.visible");
        // Should show price with Naira symbol
        cy.contains("₦").should("be.visible");
    });

    it("has an Add to Cart button", () => {
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();

        cy.contains("button", /add to cart/i).should("be.visible");
    });

    it("can add product to cart", () => {
        cy.visit("/shop");
        cy.get("a[href^='/product/']").first().click();

        cy.contains("button", /add to cart/i).click();
        // Should show confirmation or update cart count
        cy.contains(/added to cart/i).should("be.visible");
    });
});
