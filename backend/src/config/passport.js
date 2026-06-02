const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const prisma = require('./db');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const isAdmin = ['udaykumar199881@gmail.com', 'poloju.ganeshchary@gmail.com'].includes(email);

    // Check by googleId first, then fall back to email (handles seeded admin accounts)
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: profile.id }, { email }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email,
          name: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
          role: isAdmin ? 'admin' : 'member',
          aadhaarStatus: isAdmin ? 'approved' : 'pending',
        },
      });
    } else if (user.googleId !== profile.id) {
      // Update placeholder googleId from seed with real one
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id, avatarUrl: profile.photos?.[0]?.value || user.avatarUrl },
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
