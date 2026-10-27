# AGENTS

- Product/catalog reads go only through functions in src/data/catalog.ts — Phase 2 swaps demo data for the admin backend in one place.
- Orders go through src/lib/orders.ts (browser storage in Phase 1) — keep signatures so a real backend can replace it.
- Store settings (WhatsApp, delivery fee, hours) live in src/lib/config.ts.
- Cart is a React context (src/lib/cart.tsx) persisted to localStorage.
- Brand colors are tokens in src/styles.css (navy/flame); buttons use btn-flame / btn-navy utilities.
- Manual counter sales use create_manual_sale, which validates admin access and authoritative prices and updates stock atomically; never register manual sales with the public checkout function.
- Sale receipts render in a body portal with print-only isolation and are non-fiscal until an authorized fiscal issuer is integrated.
- Retired loyalty data remains stored for historical integrity; storefront and manual sales must not enroll customers or depend on loyalty RPCs.
- Customer sessions are shared through CustomerAuthProvider with one identity-transition subscription to preserve administrative session updates.
- Registered customers are admin-only records accessed through customer-records; sales copy customer details and keep alternate addresses local to the sale so saved addresses remain unchanged.
- Order WhatsApp links use order-messages to derive drafts from the persisted status; sending remains an explicit action in WhatsApp, not an automatic notification.
