# 🚚 QuickDrop

A full-stack logistics and parcel delivery management system built with the MERN stack.

QuickDrop enables customers to book deliveries, administrators to manage operations, and delivery agents to track and complete deliveries efficiently.

---

## ✨ Features

### Customer
- Register & Login
- Book Delivery
- Track Orders
- View Order History
- Dashboard

### Admin
- Dashboard Analytics
- Manage Orders
- Manage Delivery Agents
- Manage Zones
- Manage Rate Cards
- Auto Agent Assignment

### Delivery Agent
- Login
- View Assigned Orders
- Update Delivery Status
- Mark Pickup & Delivery
- Dashboard

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Nodemailer

---

## 📂 Project Structure

```
QuickDrop/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/thewizon/QuickDrop.git

cd QuickDrop
```

---

## 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file using `.env.example`.

Start backend

```bash
npm run dev
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file using `.env.example`.

Start frontend

```bash
npm run dev
```

---

# 🔐 Default Admin

Run

```bash
node seedAdmin.js
```

Default credentials

Email

```
admin@delivery.com
```

Password

```
Admin@123
```

---

# 📸 Screenshots

Add screenshots here after deployment.

---

# 📜 License

MIT License
