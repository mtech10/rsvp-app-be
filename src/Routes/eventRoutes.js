import express from "express";
import { protect } from "../middleware/auth.js";
import { createEvent } from "../controllers/eventController.js";

const router = express.Router();

router.use(protect);
router.post("/", createEvent);

export default router;
