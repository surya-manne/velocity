---
$schema: "../../../../schemas/marketplace-pack.schema.json"
id: ecommerce
name: "E-Commerce Domain Pack"
version: "1.0.0"
type: domain
description: >-
  Domain pack for e-commerce and marketplace products. Seeds CONTEXT.md with
  canonical commerce terms (Product, SKU, Order, Cart, Checkout, Fulfillment,
  Return, Inventory, Merchant, Storefront, etc.), injects commerce-specific grill
  questions covering pricing, inventory, fulfilment, and marketplace models, and
  adds guardrails for price integrity, inventory consistency, and idempotent
  order processing.
author:
  name: Velocity Team
  url: https://velocity.dev
  verified: true
license: MIT
velocity_version_min: "2.0"
tags:
  - ecommerce
  - marketplace
  - retail
  - commerce
  - inventory
  - orders
  - fulfillment
homepage: https://velocity.dev/marketplace/ecommerce
repository: https://github.com/velocity-dev/packs/ecommerce

signals:
  file_patterns:
    - "**/order*.{ts,js,py,java,go}"
    - "**/cart*.{ts,js,py,java,go}"
    - "**/product*.{ts,js,py,java,go}"
    - "**/inventory*.{ts,js,py,java,go}"
    - "**/checkout*.{ts,js,py,java,go}"
    - "**/fulfillment*.{ts,js,py,java,go}"
    - "**/shopify/**"
    - "**/stripe/**"
  import_patterns:
    - "shopify"
    - "@shopify"
    - "woocommerce"
    - "commercetools"
    - "medusa"
    - "saleor"
    - "bigcommerce"
  context_md_terms:
    - Product
    - SKU
    - Order
    - Cart
    - Checkout
    - Fulfillment
    - Inventory
    - Merchant
    - Storefront
  dependency_names:
    - "@shopify/shopify-api"
    - "@medusajs/medusa"
    - "@commercetools/sdk-client"
    - saleor-sdk
    - woocommerce-rest-api

contents:
  context_template:
    path: CONTEXT.md
    bounded_context: commerce
    merge_strategy: propose

  skills:
    - id: ecommerce-order-design
      name: "Order State Machine Design"
      description: "Design the order state machine covering placement, payment, fulfillment, shipment, delivery, return, and refund states with correct transition rules and idempotency."
      path: skills/order-design/SKILL.md
      category: domain

    - id: ecommerce-inventory-design
      name: "Inventory Management Design"
      description: "Design inventory models covering stock allocation, reservation, oversell prevention, multi-warehouse/location inventory, and real-time vs. periodic sync strategies."
      path: skills/inventory-design/SKILL.md
      category: domain

    - id: ecommerce-pricing-design
      name: "Pricing and Promotions Design"
      description: "Design pricing models covering base price, sale price, tiered pricing, promotional discounts, coupon codes, and price consistency rules to prevent race conditions."
      path: skills/pricing-design/SKILL.md
      category: domain

    - id: ecommerce-marketplace-design
      name: "Marketplace and Multi-Merchant Design"
      description: "Design multi-merchant marketplace models covering merchant onboarding, product listing ownership, split payouts, commission calculation, and dispute resolution."
      path: skills/marketplace-design/SKILL.md
      category: domain

  guardrails:
    path: guardrails.md
    merge_strategy: append

  grill_seeds:
    product:
      - "Is this a single-merchant storefront or a multi-merchant marketplace? This is the most consequential architectural decision — it affects the entire data model."
      - "What is the product catalog model? (Flat products, product variants with SKUs, product bundles, configurable products, digital goods)"
      - "What is the pricing model? (Fixed, tiered, dynamic, subscription, usage-based, auction)"
      - "Does the platform need to handle tax calculation? (Which tax service? Avalara, TaxJar, Stripe Tax? Or manual tax rate tables?)"
      - "What is the return and refund policy? (Automated returns, merchant-handled returns, return merchandise authorisation flow)"
      - "Is there a subscription or recurring revenue component? (Subscription billing changes the Order and Fulfillment model significantly)"
      - "Which markets (countries/currencies) are in scope for v1? (Multi-currency and multi-locale adds significant complexity)"

    architecture:
      - "What is the Order state machine? (List the states — e.g. Pending → Payment Captured → Awaiting Fulfillment → Fulfilled → Shipped → Delivered → Completed / Cancelled / Refunded)"
      - "How is inventory oversell prevented? (Optimistic locking, pessimistic locking, reservation system, or accept oversell with backorder?)"
      - "What is the Cart model? (Session-based anonymous cart, authenticated cart, server-side vs. client-side cart?)"
      - "How are price changes handled mid-checkout? (Cart price frozen at add-to-cart? At checkout initiation? At payment capture?)"
      - "What is the fulfillment model? (Platform fulfills, merchant fulfills, third-party logistics (3PL), drop-ship?)"
      - "How are promotions and discounts structured? (Global discounts, product-specific discounts, coupon codes — what is the priority/stacking rule?)"
      - "Is the search experience powered by a dedicated search service? (Elasticsearch/OpenSearch, Algolia, Typesense) This affects the product indexing model."
      - "How is the catalog synchronized with the search index? (Synchronous write-through, async event-driven, periodic batch?)"

    security:
      - "Is payment card data (PAN) ever held by the platform? If so, PCI-DSS scope applies — what is the tokenization strategy?"
      - "How is price manipulation on the server side prevented? (Never trust client-supplied price — always recompute from catalog on the server)"
      - "What is the authorization model? (Customers can only access their own orders; merchants can only access their own products and orders)"
      - "How are promotional codes protected against brute-force enumeration? (Rate limiting, one-time use codes, hashed comparison)"

    performance:
      - "What is the expected catalog size? (Thousands vs. millions of SKUs changes indexing and search strategy)"
      - "What is the peak order volume? (Black Friday, flash sales — can the checkout flow handle N simultaneous orders for the same limited-inventory SKU?)"
      - "What is the read/write ratio for the product catalog? (Typically very high read ratio — caching strategy is critical)"
      - "What is the acceptable latency for search results? (Sub-100ms is the e-commerce standard — drives choice of search infrastructure)"

    vertical_slice:
      - "Does this slice touch inventory quantities? If yes, the oversell prevention mechanism must be in place before this slice can be used in production."
      - "Does this slice touch pricing? Confirm that the server side always recomputes the price from the catalog — client-supplied price must never be trusted."
      - "Does this slice include a payment step? The payment step must be idempotent — define the idempotency key structure before implementing."
      - "What is the rollback path if this slice fails mid-order? (Order placed but payment failed? Payment captured but fulfillment failed?)"

install:
  post_install_skill: grill-with-docs
  requires_regeneration: true
---
