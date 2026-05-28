import { Request, Response } from "express";
import { addUser, editUser, listUsers, removeUser } from "../services/userService";

export async function getUsers(_req: Request, res: Response) {
  const users = await listUsers();
  return res.status(200).json(users);
}

export async function createUser(req: Request, res: Response) {
  try {
    const user = await addUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const user = await editUser(Number(req.params.id), req.body);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteUser(req: Request, res: Response) {
  const deleted = await removeUser(Number(req.params.id));

  if (!deleted) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(204).send();
}

function handleError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed";

  if (message.includes("Duplicate")) {
    return res.status(409).json({ message: "A record with this value already exists" });
  }

  return res.status(400).json({ message });
}
