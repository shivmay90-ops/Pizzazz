# 🍕 Pizzazz Goa — Pizza Ordering App

Full-stack pizza ordering web app for Pizzazz Goa with a customer-facing ordering site and admin panel.

## Stack
- **Backend**: Node.js + Express + SQLite (`node:sqlite` built-in, no compilation needed)
- **Frontend**: React 18 + Vite + React Router v6

## Quick Start

### 1. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Seed the database
```bash
cd backend && npm run seed
```

### 3. Start servers (two terminals)
```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Admin Panel

**URL**: http://localhost:5173/admin

| Field    | Value          |
|----------|----------------|
| Username | `admin`        |
| Password | `pizzazz2024`  |

### Admin features
- **Dashboard** — live stats: orders today, revenue, pending count, recent orders
- **Orders** — filter by status, update status, view full order details
- **Menu Manager** — add/edit/delete items, toggle availability

---

## Customer Site

- Browse menu by category (Pizza, Sides, Drinks, Desserts)
- Add to cart with live quantity controls
- Cart drawer with subtotal + delivery fee
- Checkout with name, phone, address, special instructions
- Order confirmation page with order ID and status tracker

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/menu` | All available menu items |
| `POST` | `/api/orders` | Place an order |
| `GET` | `/api/health` | Health check |

### Admin (requires `Authorization: Bearer <token>`)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/login` | Get JWT token |
| `GET` | `/api/orders` | All orders (filter: `?status=Pending`) |
| `PUT` | `/api/orders/:id` | Update order status |
| `GET` | `/api/orders/stats/summary` | Dashboard stats |
| `GET` | `/api/menu/all` | All menu items incl. unavailable |
| `POST` | `/api/menu` | Add menu item |
| `PUT` | `/api/menu/:id` | Edit menu item |
| `DELETE` | `/api/menu/:id` | Delete menu item |

---

## Order Statuses
`Pending` → `Preparing` → `Ready` → `Out for Delivery` → `Delivered`

(Can also be set to `Cancelled` at any stage)
