const router = require("express").Router();
const passport = require("passport");

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
  }),
  authController.googleCallback
);

router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;