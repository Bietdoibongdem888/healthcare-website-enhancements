const passport = require('passport');
const config = require('config');
const { ensureSocialUser } = require('../services/auth.service');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const oauthConfig = config.has('oauth') ? config.get('oauth') : {};
const callbackBase =
  process.env.API_BASE_URL || oauthConfig.callbackBase || `http://localhost:${process.env.PORT || 3000}`;

function extractName(profile) {
  const given = profile?.name?.givenName || profile?.displayName?.split(' ')?.[0] || 'User';
  const family =
    profile?.name?.familyName ||
    profile?.displayName?.split(' ')?.slice(1).join(' ') ||
    profile?.name?.middleName ||
    'HealthCare';
  return { first_name: given, last_name: family };
}

async function handleSocialProfile(provider, profile, done) {
  try {
    const email = profile?.emails?.[0]?.value;
    if (!email) return done(new Error(`${provider} profile is missing email address.`));
    const { first_name, last_name } = extractName(profile);
    const user = await ensureSocialUser({ first_name, last_name, email });
    return done(null, { user, provider });
  } catch (err) {
    return done(err);
  }
}

const hasGoogle = oauthConfig.google?.clientId && oauthConfig.google?.clientSecret;
if (hasGoogle) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: oauthConfig.google.clientId,
        clientSecret: oauthConfig.google.clientSecret,
        callbackURL: `${callbackBase.replace(/\/$/, '')}/api/v1/auth/google/callback`,
      },
      (_, __, profile, done) => handleSocialProfile('google', profile, done),
    ),
  );
}

const hasFacebook = oauthConfig.facebook?.clientId && oauthConfig.facebook?.clientSecret;
if (hasFacebook) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: oauthConfig.facebook.clientId,
        clientSecret: oauthConfig.facebook.clientSecret,
        callbackURL: `${callbackBase.replace(/\/$/, '')}/api/v1/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'name'],
      },
      (_, __, profile, done) => handleSocialProfile('facebook', profile, done),
    ),
  );
}
passport.strategies = {
  google: !!hasGoogle,
  facebook: !!hasFacebook,
};

module.exports = passport;
