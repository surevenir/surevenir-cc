import express from "express";
import {
  createUser,
  getAllUsers,
  getUserAdmin,
} from "../controllers/userController";

const router = express.Router();

router.get("/users/", getAllUsers);
router.get("/users/admin", getUserAdmin);

router.post("/users", createUser);

export default router;
