import express from "express";
import UserController from "../controllers/userController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";
import multer from "../middlewares/multer";

const userRouter = express.Router();

userRouter.get("/", authenticate, UserController.getAllUsers);
userRouter.get(
  "/admin",
  authenticate,
  authorizeAdmin,
  UserController.getUserAdmin
);
userRouter.post(
  "/",
  multer.single("image"),
  UserController.createUser
);
userRouter.patch(
  "/:id",
  authenticate,
  multer.single("image"),
  UserController.updateUser
);
userRouter.delete("/:id", authenticate, UserController.deleteUser);

export default userRouter;
