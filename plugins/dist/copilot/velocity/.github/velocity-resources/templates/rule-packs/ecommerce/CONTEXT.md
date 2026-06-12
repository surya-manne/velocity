# CONTEXT.md — Commerce Domain

> **Template:** E-Commerce Domain Pack v1.0.0
> **Bounded context:** commerce
> **Usage:** Populate Terms and Decisions during a `grill-with-docs` session. Terms marked `[FILL]` require project-specific definitions.

---

## Terms

**Product**: A good or service offered for sale in the Storefront. A Product has one or more Variants. [FILL: specify whether Products can be digital goods, physical goods, or both]

**Variant**: A specific combination of Product attributes (size, color, format) that can be purchased independently. Each Variant has exactly one SKU.

**SKU (Stock Keeping Unit)**: The unique identifier for a specific, purchasable version of a Product. SKUs are the units of inventory tracking and order line items.

**Catalog**: The complete set of Products and Variants available in the Storefront. The Catalog is maintained by [FILL: platform admin, individual Merchants, or both].

**Storefront**: The customer-facing interface through which Customers browse the Catalog, add items to a Cart, and complete a Checkout. [FILL: web-only, mobile, or headless/API-first]

**Cart**: A transient collection of Cart Items assembled by a Customer before Checkout. A Cart is associated with a Customer (authenticated) or a session (anonymous). Cart contents are not reserved Inventory — they represent intent only. [FILL: server-side or client-side cart? What is the cart expiry policy?]

**Cart Item**: A single line in the Cart representing one SKU at a quantity and the price at the time of adding. [FILL: is the price frozen at add-to-cart time or recomputed at checkout?]

**Checkout**: The process through which a Customer converts a Cart into a confirmed Order. Checkout includes: address collection, shipping method selection, discount application, tax calculation, and payment capture.

**Order**: A confirmed purchase of one or more Order Lines by a Customer. An Order is immutable after confirmation — modifications require a Cancellation, Return, or Exchange. [FILL: define your Order state machine — list all valid states]

**Order State**: [FILL — define your state machine. Example states: `pending_payment`, `payment_captured`, `awaiting_fulfillment`, `fulfilling`, `shipped`, `delivered`, `completed`, `cancelled`, `refund_pending`, `refunded`]

**Order Line**: A single SKU at a quantity within an Order, with a confirmed price, applicable discounts, and tax.

**Price**: The amount in a given Currency that a Customer pays for one unit of a Variant at a specific moment in time. Price is always computed on the server — never trusted from the client.

**Sale Price**: A temporary reduced Price for a Variant, valid for a defined period. Sale Price takes precedence over the Base Price during its validity window.

**Discount**: A reduction in the Order or Order Line total, applied through a Promotion or Coupon Code. [FILL: specify your discount stacking rules — do multiple discounts combine or does the highest discount win?]

**Promotion**: A rule-based Discount trigger — e.g., "10% off orders over $100," "buy 2 get 1 free." Promotions are managed by [FILL: platform admin, Merchants, or both].

**Coupon Code**: A customer-redeemable code that unlocks a specific Discount. Coupon Codes are [FILL: single-use or multi-use? Per-customer or global?].

**Tax**: A statutory charge added to the Order total based on the Customer's shipping address and the product type. Tax is calculated by [FILL: tax service (Avalara, TaxJar, Stripe Tax) or manual rate table].

**Inventory**: The quantity of each SKU physically available to fulfill Orders. Inventory is tracked at the [FILL: global warehouse, per-location/warehouse, or per-Merchant] level.

**Inventory Reservation**: A temporary hold on Inventory quantity when a Cart is converted to an Order and payment is pending. Reservations expire if payment is not captured within [FILL — e.g. 15 minutes]. Prevents oversell during the payment window.

**Oversell**: The condition where more units of a SKU are sold than are available in Inventory. [FILL: does the platform allow oversell (backorder) or prevent it?]

**Fulfillment**: The process of picking, packing, and shipping the physical goods in an Order. Fulfillment is performed by [FILL: platform warehouse, individual Merchants, 3PL (e.g. ShipBob, Deliverr), or drop-ship].

**Shipment**: A physical package sent to the Customer's shipping address. An Order may generate one or more Shipments (e.g., if items ship from different warehouses or arrive at different times).

**Tracking Number**: The carrier-assigned identifier for a Shipment that allows the Customer to track delivery status. Provided by [FILL: carrier API — UPS, FedEx, USPS, DHL, Shippo, EasyPost].

**Return**: A Customer-initiated request to send purchased goods back to the Merchant or platform for a Refund or Exchange. [FILL: what is the return window? Who bears return shipping cost?]

**Refund**: A reversal of payment for a returned or cancelled Order or Order Line. Refunds are processed through the original Payment Method. Refund processing time: [FILL — e.g. 5–10 business days for card refunds].

**Exchange**: A Return in which the Customer receives a replacement item (different size, color, or product) instead of a cash Refund. [FILL: is exchange supported in v1?]

**Merchant**: [FILL — only applicable for marketplace model] An entity that lists Products in the Storefront and fulfills Orders for their Products. Each Merchant has a separate inventory, pricing, and payout account.

**Marketplace**: [FILL — only applicable for multi-merchant model] A platform model in which multiple Merchants list Products in a shared Storefront. The platform earns a Commission on each sale.

**Commission**: [FILL — only applicable for marketplace model] The percentage or fixed fee retained by the platform from each Order attributed to a Merchant.

**Payout**: [FILL — only applicable for marketplace model] The net amount transferred to a Merchant's bank account after deducting the Commission. Payout timing: [FILL — e.g. T+2 after delivery confirmation].

**Customer**: An individual or organization that browses the Storefront and places Orders. [FILL: specify whether Customers are always authenticated, or whether guest checkout is supported]

**Guest Checkout**: A Checkout flow in which the Customer does not create an account. Guest orders are associated with an email address only. [FILL: is guest checkout supported?]

**Wishlist**: [FILL if applicable] A named collection of Products saved by an authenticated Customer for future purchase. Not a Cart — no Inventory reservation.

**Search**: [FILL — search service used: Elasticsearch/OpenSearch, Algolia, Typesense, Shopify Search. Describe indexing strategy and sync model.]

---

## Decisions

[FILL — document non-obvious decisions made during grill-with-docs. Examples below:]

- **Price trust boundary**: Price is always recomputed on the server from the Catalog at checkout time. Client-supplied price is never trusted. (Rationale: price manipulation prevention)
- **Inventory model**: [FILL — optimistic locking / pessimistic locking / reservation system / accept oversell with backorder]
- **Cart persistence**: [FILL — server-side DB, client-side localStorage/cookie, or hybrid]
- **Order immutability**: Orders are immutable after confirmation. Modifications create new records (Return, Exchange, Partial Refund). (Rationale: audit trail integrity)
- **Tax calculation**: [FILL — your tax service and rounding strategy]
- [FILL: your discount stacking rules]
- [FILL: your fulfillment routing rules for multi-warehouse or multi-merchant]

---

## Bounded Contexts

[FILL — if monorepo, list adjacent bounded contexts]

- **commerce** — this context
- [FILL: e.g., catalog — ../catalog/CONTEXT.md]
- [FILL: e.g., payments — ../payments/CONTEXT.md]
- [FILL: e.g., logistics — ../logistics/CONTEXT.md]
