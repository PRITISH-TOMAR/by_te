import express, { Router, Request, Response } from "express";
import { ShortenResource } from "../services/resource_service";

const router: Router = express.Router();

router.post("/shorten", ShortenResource);

export default router;
