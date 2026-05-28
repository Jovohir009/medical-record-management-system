import express from "express";
import cors from "cors";
import { db } from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import patientRoutes from "./routes/patientRoutes";
import diagnosisRoutes from "./routes/diagnosisRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { authenticateToken } from "./middleware/authMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/doctors", authenticateToken, doctorRoutes);
app.use("/api/patients", authenticateToken, patientRoutes);
app.use("/api/diagnoses", authenticateToken, diagnosisRoutes);
app.use("/api/appointments", authenticateToken, appointmentRoutes);
app.use("/api/departments", authenticateToken, departmentRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error,
    });
  }
});

export default app;
