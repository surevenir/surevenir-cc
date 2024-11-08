import express from "express";
import UserController from "../controllers/userController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const userRouter = express.Router();

userRouter.get("/", authenticate, UserController.getAllUsers);
userRouter.get(
  "/admin",
  authenticate,
  authorizeAdmin,
  UserController.getUserAdmin
);
userRouter.post("/", UserController.createUser);
userRouter.patch("/:id", authenticate, UserController.updateUser);
userRouter.delete("/:id", authenticate, UserController.deleteUser);

export default userRouter;
