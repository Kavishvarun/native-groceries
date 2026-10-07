# Native Groceries

A white, responsive storefront for Tamil Nadu groceries, built with React, TypeScript, and Vite. Browse rice, wheat and flours, pulses, leafy greens, fruit, and vegetables with prices in Indian rupees (INR), or use the floating seasonal pick on Home.

## Run locally

```sh
npm install
npm start
```

`npm start` runs the frontend and API and asks Vite to open the storefront in your browser. The frontend uses the first available Vite port (normally `http://localhost:5173`); the API listens on port `3001`.

## Pages

- `/` Home
- `/about` About
- `/products` grocery catalog with search, categories, and pagination
- `/cart` Persistent shopping cart and cash-on-delivery checkout
- `/login` Store partner sign-in interface
- `/contact` Contact form and store details

The Contact form stores submissions in `server/data/messages.json`. Orders are saved in `server/data/orders.json`; product data is stored in `server/data/products.json` and seeded on first run. Login is currently a frontend interface; authentication is not configured.

## API

- `GET /api/products?page=1&limit=8&search=&category=` returns filtered products and pagination metadata.
- `GET /api/summary` returns inventory totals and low-stock counts.
- `POST /api/products` creates a product.
- `PATCH /api/products/:id` updates a product.
- `DELETE /api/products/:id` removes a product.
- `POST /api/contact` validates and stores a contact message.
- `POST /api/orders` validates stock, calculates INR totals and delivery, decrements inventory, and stores a cash-on-delivery order.

Run `npm run build` for a production build and `npm run lint` for lint checks.
