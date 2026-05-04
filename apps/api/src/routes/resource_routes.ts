import express, { Router, Request, Response } from "express";
import { ShortenRequestSchema } from "../dto/request/resources/shorten_request_dto";
import { authenticateJwt } from "../middleware/authenticateJwt";
import { validateBody } from "../middleware/validateBody";
import { getResource, ShortenResource } from "../services/resource_service";

const router: Router = express.Router();

router.post(
  "/",
  authenticateJwt,
  validateBody(ShortenRequestSchema),
  ShortenResource,
);
router.get("/:shortCode", getResource);

export default router;
