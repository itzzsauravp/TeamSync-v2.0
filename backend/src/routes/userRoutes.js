import { Router } from "express";
import authenticateJWT from "../middlewares/authenticateJWT.js";
import UserController from "../controllers/userController.js";

const userRouter = Router();
const {
  getAllUsers,
  getSpecificUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = new UserController();

userRouter.get("/all", getAllUsers);
userRouter.post("/username", getSpecificUser);
userRouter.get("/profile/:userId", getUserProfile);
userRouter.put("/profile", authenticateJWT, updateUserProfile);
userRouter.delete("/delete", authenticateJWT, deleteUserProfile);

export default userRouter;
