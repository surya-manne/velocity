---
$schema: "../../../../schemas/guardrails.schema.json"
version: "2.0"
pack: ecommerce
name: "E-Commerce Guardrails"
description: >-
  Guardrails for e-commerce and marketplace products. Enforces server-side price
  computation, inventory oversell prevention, idempotent order processing, cart
  security, and coupon code protection. Extends the base Velocity guardrails.

risk_score_modifier: +10 # Inventory and price integrity bugs have direct revenue impact

# ─── Guardrails ────────────────────────────────────────────────────────────────

guardrails:
  ecommerce.server_side_price_required:
    title: "Price must be computed server-side"
    description: "Order total and line item prices must always be computed from the server-side catalog. Client-supplied price values must never be used for charging. Price manipulation is a critical security vulnerability."
    severity: block
    category: security

  ecommerce.inventory_reservation_required:
    title: "Inventory must be reserved before payment capture"
    description: "Before capturing payment for an Order, inventory must be reserved to prevent oversell. Orders that attempt payment without inventory reservation are a blocking guardrail violation."
    severity: block
    category: engineering

  ecommerce.order_idempotency_required:
    title: "Order creation must be idempotent"
    description: "Order creation endpoints must carry an idempotency key to prevent duplicate orders on retry. Missing idempotency on order creation is a blocking violation."
    severity: block
    category: engineering

  ecommerce.order_immutability:
    title: "Confirmed orders must not be mutated"
    description: "No UPDATE statement against the orders table for fields set at confirmation time. Modifications must create new records (Return, Exchange, Partial Refund). Direct order mutation corrupts the audit trail."
    severity: block
    category: engineering

  ecommerce.tax_server_side_required:
    title: "Tax must be computed server-side"
    description: "Tax amounts must be calculated by the server from the shipping address and product type. Client-supplied tax values are never used. Tax undercollection is a compliance and revenue risk."
    severity: block
    category: compliance

  ecommerce.cart_expiry_enforced:
    title: "Carts must have an expiry policy"
    description: "Anonymous and authenticated carts must expire after a defined period of inactivity. Stale carts holding inventory reservations must be released to prevent permanent inventory lock."
    severity: warn
    category: engineering

  ecommerce.coupon_rate_limit_required:
    title: "Coupon redemption must be rate-limited"
    description: "Coupon code redemption endpoints must be rate-limited to prevent brute-force enumeration. Single-use coupon codes must enforce one-time use atomically to prevent race conditions."
    severity: warn
    category: security

# ─── PreToolUse Hooks ──────────────────────────────────────────────────────────

hooks:
  - id: ecommerce.block-client-price-trust
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(req\\.body|request\\.body|params|query)\\.(price|total|amount|subtotal|tax)"
    action: warn
    message: "Client-supplied price field detected in request handling. Confirm this value is NOT used for charging. Always recompute price from the server-side catalog. Client price values must be treated as untrusted input."

  - id: ecommerce.block-order-update
    event: PreToolUse
    tool: Bash
    pattern: "(?i)UPDATE\\s+orders?\\s+SET\\s+(?!status)"
    action: warn
    message: "Direct order update detected (non-status field). Confirmed orders are immutable — create a new record (Return, Exchange, Refund) instead of updating the original order. Status-only updates are permitted."

  - id: ecommerce.block-inventory-decrement-without-lock
    event: PreToolUse
    tool: Bash
    pattern: "(?i)UPDATE\\s+(inventory|stock|variants?)\\s+SET\\s+(quantity|stock_level|available)\\s*=\\s*(?!.*WHERE)"
    action: block
    message: "Inventory decrement without WHERE clause blocked. Always update inventory with a WHERE quantity >= decrement_amount condition to prevent negative inventory. Missing condition causes oversell."

  - id: ecommerce.warn-missing-idempotency-order
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(createOrder|placeOrder|submitOrder|confirmOrder)(?!.*idempotency)"
    action: warn
    message: "Order creation function detected without idempotency key parameter. Add an idempotency key to prevent duplicate orders on network retry."

  - id: ecommerce.warn-hardcoded-price
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(price|amount|total|subtotal)\\s*=\\s*[0-9]+(?:\\.[0-9]+)?"
    action: warn
    message: "Hardcoded price value detected. Prices must be fetched from the catalog at runtime, not hardcoded. Hardcoded prices cause revenue discrepancies when catalog prices change."

  - id: ecommerce.block-coupon-plaintext-compare
    event: PreToolUse
    tool: Bash
    pattern: "(?i)(coupon|promo.?code|discount.?code).*==|=== .*(?i)(coupon|promo.?code)"
    action: warn
    message: "Coupon code plain-text comparison detected. Use constant-time comparison to prevent timing attacks that could reveal valid coupon codes."
---
