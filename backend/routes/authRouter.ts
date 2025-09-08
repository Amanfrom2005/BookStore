import { Response, Request, Router, NextFunction } from "express";
import * as authController from "../controllers/authController";
import { authenticatedUser } from "../middleware/authMiddleware";
import passport from "passport";
import { IUser } from "../models/User";
import { generateToken } from "../utils/generateToken";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

router.get("/verify-email/:token", authController.verifyEmail);
router.get("/logout", authController.logout);
router.get("/verify-auth", authenticatedUser, authController.checkUserAuth);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {failureRedirect: `${process.env.FRONTEND_URL}`,session: false,}),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUser;
      const accessToken = await generateToken(user);
      res.cookie("access_token", accessToken, { httpOnly: true,  sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000});
      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (error) {next(error);}
  }
);

export default router;
