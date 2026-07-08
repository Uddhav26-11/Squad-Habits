const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error(
    "[passport] WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. " +
      "Google OAuth will fail. Set these in your environment (.env locally, " +
      "Render Environment tab in production)."
  );
}

const callbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`;

console.log(`[passport] Using Google callback URL: ${callbackURL}`);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(`[passport] Google profile received: id=${profile.id} email=${profile.emails?.[0]?.value}`);

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : "",
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
          });
          console.log(`[passport] Created new user from Google profile: ${user._id}`);
        } else {
          console.log(`[passport] Existing user matched: ${user._id}`);
        }

        done(null, user);
      } catch (err) {
        console.error("[passport] Error in Google strategy callback:", err.message);
        done(err, null);
      }
    }
  )
);

module.exports = passport;