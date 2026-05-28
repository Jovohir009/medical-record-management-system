import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/userController";
import { authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getUsers);
router.post("/", authorizeRoles("administrator"), createUser);
router.put("/:id", authorizeRoles("administrator"), updateUser);
router.delete("/:id", authorizeRoles("administrator"), deleteUser);

export default router;
