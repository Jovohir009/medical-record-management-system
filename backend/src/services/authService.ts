import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserById,
  updateLastLogin,
} from "../repositories/userRepository";

export interface LoginResult {
  token: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await findUserByEmail(email);

  if (!user || user.status !== "active") {
    throw new Error("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "8h",
    }
  );

  await updateLastLogin(user.id);

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getCurrentUser(userId: number) {
  const user = await findUserById(userId);

  if (!user || user.status !== "active") {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}
