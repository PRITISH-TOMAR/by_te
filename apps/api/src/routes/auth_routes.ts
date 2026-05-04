import express, { Router } from "express";
import {
  LoginRequestSchema,
  SignupRequestSchema,
} from "../dto/request/auth/auth_request_dto";
import { authenticateJwt } from "../middleware/authenticateJwt";
import { validateBody } from "../middleware/validateBody";
import { login, logout, signup } from "../services/auth_service";

const router: Router = express.Router();

router.post("/signup", validateBody(SignupRequestSchema), signup);
router.post("/login", validateBody(LoginRequestSchema), login);
router.post("/logout", authenticateJwt, logout);

export default router;
