const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const config = require('./env');

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE.CLIENT_ID,
      clientSecret: config.GOOGLE.CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Check if user already exists with this googleId
        let user = await User.findOne({ where: { googleId: id } });

        if (user) {
          return done(null, user);
        }

        // If not, check if user exists with this email
        user = await User.findOne({ where: { email } });

        if (user) {
          // Link google account to existing user
          user.googleId = id;
          await user.save();
          return done(null, user);
        }

        // If user doesn't exist, create new user
        // Note: phone and password will be null for Google-only users
        const userCount = await User.count();
        const role = userCount === 0 ? 'admin' : 'user';

        user = await User.create({
          name: displayName,
          email,
          googleId: id,
          role,
          isActive: true,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
