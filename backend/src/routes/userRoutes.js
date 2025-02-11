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
  updateUserAttributes,
} = new UserController();

userRouter.get("/all", authenticateJWT, getAllUsers);
userRouter.post("/username", authenticateJWT, getSpecificUser);
userRouter.get("/profile/:userId", authenticateJWT, getUserProfile);
userRouter.put("/profile", authenticateJWT, updateUserProfile);
userRouter.delete("/delete", authenticateJWT, deleteUserProfile);
userRouter.put("/update-attributes", authenticateJWT, updateUserAttributes);

export default userRouter;
