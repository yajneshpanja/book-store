import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateLogin } from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

/**
 * POST /api/auth/login  — authenticate with email + password, receive JWT
 */
router.post('/login', validateLogin, validate, authController.login);

export default router;
