# Native Groceries Implementation Plan



## 1. Storefront foundation

- Use React, TypeScript, Vite, and Express.
- Provide responsive Home, About, Products, Login, and Contact pages with shared navigation and footer.
- Apply a clear Tamil Nadu grocery identity and Indian rupee pricing.
- Status: Complete.

## 2. Regional catalog

- Seed Tamil Nadu staples across rice and grains, wheat and flours, pulses, leafy greens, fruits, and vegetables.
- Support catalog search, category filtering, and server-side pagination.
- Match catalog cards to ingredient imagery and feature a floating seasonal produce card on Home.
- Status: Complete.

## 3. Shopping and checkout

- Persist cart lines in the browser and allow quantity changes and removal.
- Calculate subtotal and delivery in INR; provide cash-on-delivery checkout.
- Revalidate product availability and stock on the server, calculate the order total independently, decrement inventory, and save the order.
- Status: Complete.

## 4. Production readiness

- Replace JSON-file storage with a transactional database before handling concurrent real orders.
- Add authenticated customer accounts and order history.
- Integrate a payment provider if online payments are needed; configure real delivery coverage, contact details, and fulfillment rules.
- Add automated API and checkout tests, rate limiting, and deployment configuration.
- Status: Planned.
