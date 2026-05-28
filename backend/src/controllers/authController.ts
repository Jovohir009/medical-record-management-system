import { Request, Response } from "express";
import { getCurrentUser, loginUser } from "../services/authService";
import { AuthRequest } from "../middleware/authMiddleware";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginUser(email, password);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({ user });
  } catch {
    return res.status(401).json({ message: "Invalid authenticated user" });
  }
}
