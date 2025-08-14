import express from "express";
import { authenticatedUser } from "../middleware/authMiddleware";
import * as addressController from "../controllers/addressController";

const router = express.Router();

router.post("/create-or-update", authenticatedUser, addressController.createOrUpdateAddressByUserId);
router.get("/", authenticatedUser, addressController.getAddressByUserId);

export default router;
