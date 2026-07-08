const router = require("express").Router();
const passport = require("passport");

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

router.get(
  "/google",
  (req, res, next) => {
    console.log("[authRoutes] /google hit — redirecting to Google OAuth consent screen");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("[authRoutes] /google/callback hit, query:", req.query);
    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${frontendUrl}/login?error=google_auth_failed`,
  }),
  authController.googleCallback
);

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;