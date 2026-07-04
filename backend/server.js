const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

require("dotenv").config();

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const zoneRoutes = require("./routes/zoneRoutes");
const rateCardRoutes = require("./routes/rateCardRoutes");
const orderRoutes = require("./routes/orderRoutes");
const agentRoutes = require("./routes/agentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const codConfigRoutes = require("./routes/codConfigRoutes");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

// Error Middleware
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Connect Database
connectDB();

// ===== Global Middleware =====
app.use(cors());
app.use(express.json());

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/rate-cards", rateCardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cod-config", codConfigRoutes);

// ===== Swagger =====
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

// ===== Error Middleware (Always Last) =====
app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});