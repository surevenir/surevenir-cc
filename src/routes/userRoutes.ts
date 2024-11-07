import express from "express";
import {
  createUser,
  getAllUsers,
  getUserAdmin,
} from "../controllers/userController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authorizeAdmin";

const router = express.Router();

router.get("/users", authenticate, getAllUsers);
router.get("/users/admin", authenticate, authorizeAdmin, getUserAdmin);

router.post("/users", createUser);

export default router;
