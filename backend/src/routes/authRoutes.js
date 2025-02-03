import { Router } from "express";
import "dotenv/config";
import AuthController from "../controllers/authController.js";

const authRouter = Router();
const { registerUser, loginUser, validateToken } = new AuthController();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/validate-token", validateToken);

export default authRouter;
