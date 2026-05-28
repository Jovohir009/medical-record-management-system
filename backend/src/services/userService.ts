import bcrypt from "bcryptjs";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  UserInput,
} from "../repositories/userRepository";

export async function listUsers() {
  return getUsers();
}

export async function addUser(input: UserInput & { password?: string }) {
  const password_hash = await bcrypt.hash(input.password || "password", 10);

  return createUser({
    full_name: input.full_name,
    email: input.email,
    password_hash,
    role: input.role,
    status: input.status ?? "active",
  });
}

export async function editUser(
  id: number,
  input: Partial<UserInput> & { password?: string }
) {
  const payload: Partial<UserInput> = { ...input };

  if (input.password) {
    payload.password_hash = await bcrypt.hash(input.password, 10);
  }

  return updateUser(id, payload);
}

export async function removeUser(id: number) {
  return deleteUser(id);
}
