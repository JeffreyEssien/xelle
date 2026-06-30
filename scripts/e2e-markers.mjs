// Single source of truth for E2E test-data markers.
// Imported by both the Cypress specs (when they create data) and the
// cleanup script, so the "what to create" and "what to delete" can never drift.
//
// Every marker is a value no real customer/product/coupon could plausibly own:
//  - the email uses the reserved `.test` TLD (RFC 6761 — never deliverable/registrable)
//  - slug/sku/coupon prefixes contain NO SQL LIKE wildcards (`%` or `_`)
// Keep them long and distinctive; the cleanup script refuses short markers.

export const E2E_EMAIL = "e2e@xelle-ci.test";
export const E2E_NAME = "E2E Test Customer";
export const E2E_PRODUCT_SLUG_PREFIX = "e2e-ci-"; // products created by E2E
export const E2E_COUPON_PREFIX = "E2ECITEST"; // coupons created by E2E
export const E2E_SKU_PREFIX = "E2E-CI-"; // inventory items created by E2E
