// TODO add inGroup middleware

import { Router } from "express";
import "dotenv/config";
import authenticateJWT from "../middlewares/authenticateJWT.js";
import { addColumn, removeColumn, getAllColumns } from "../controllers/ColumnController.js";

const columnRouter = Router();

columnRouter.post("/add", authenticateJWT, addColumn);
columnRouter.post("/remove", authenticateJWT, removeColumn);
columnRouter.post("/list", authenticateJWT, getAllColumns);

export default columnRouter;
