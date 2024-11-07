import express from "express";
import UserController from "../controllers/userController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.get("/users", authenticate, UserController.getAllUsers);
router.get("/users/admin", authenticate, authorizeAdmin, UserController.getUserAdmin);

router.post("/users", UserController.createUser);

export default router;
