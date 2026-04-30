import express, { Router, Request, Response } from "express";
import { checkHealth } from "../services/health_service";
const router: Router = express.Router();

router.get("/", (req: Request, res: Response) => checkHealth(res));

export default router;
