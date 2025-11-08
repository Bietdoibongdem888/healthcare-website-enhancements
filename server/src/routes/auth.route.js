const express = require('express');
const router = express.Router();
const passport = require('../providers/passport');
const {
  login,
  register,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  me,
  socialSuccess,
  socialFailure,
  forgotPasswordEmailOtp,
  resetPasswordEmailOtp,
  forgotPasswordPhone,
  resetPasswordPhone,
} = require('../controllers/auth.controller');
const { auth } = require('../middleware');
const authRateLimit = require('../middleware/authRateLimit');

router.post('/login', authRateLimit, login);
router.post('/register', authRateLimit, register);
router.post('/refresh', authRateLimit, refresh);
router.post('/logout', logout);
router.post('/change-password', auth, changePassword);
router.post('/forgot-password', authRateLimit, forgotPassword);
router.post('/reset-password', authRateLimit, resetPassword);
router.post('/forgot-password/email-otp', authRateLimit, forgotPasswordEmailOtp);
router.post('/reset-password/email-otp', authRateLimit, resetPasswordEmailOtp);
router.post('/forgot-password/phone', authRateLimit, forgotPasswordPhone);
router.post('/reset-password/phone', authRateLimit, resetPasswordPhone);
router.get('/me', auth, me);

if (passport.strategies?.google) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/api/v1/auth/oauth/failure?provider=google',
    }),
    socialSuccess,
  );
} else {
  router.get('/google', (_, res) => res.status(503).json({ message: 'Google login is not configured.' }));
}

if (passport.strategies?.facebook) {
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
  router.get(
    '/facebook/callback',
    passport.authenticate('facebook', {
      session: false,
      failureRedirect: '/api/v1/auth/oauth/failure?provider=facebook',
    }),
    socialSuccess,
  );
} else {
  router.get('/facebook', (_, res) => res.status(503).json({ message: 'Facebook login is not configured.' }));
}

router.get('/oauth/failure', socialFailure);

module.exports = router;
