const Joi = require('joi');
const { TokenPair, verify } = require('../providers/jwt');
const { hashPassword, comparePassword } = require('../providers/hash');
const { Unauthorized, BadRequest, NotFound } = require('../../helpers/errors');
const { v4: uuid } = require('uuid');
const Redis = require('ioredis');
const config = require('config');
const mail = require('../providers/mail');
const { audit } = require('../providers');
const { Staff, Patient, sequelize } = require('../database');
const { issueTokenForStaff } = require('../services/auth.service');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,64}$/;
const PHONE_REGEX = /^\d{10}$/;

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(150).required(),
  last_name: Joi.string().min(2).max(150).required(),
  phone: Joi.string()
    .pattern(PHONE_REGEX)
    .messages({ 'string.pattern.base': 'Phone must contain exactly 10 digits.' })
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message('Password must be 8-64 characters and include uppercase, lowercase, digit and special character.')
    .required(),
  role: Joi.string().valid('admin', 'doctor', 'patient').default('patient'),
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message('Password must be 8-64 characters and include uppercase, lowercase, digit and special character.')
    .required(),
});

const forgotSchema = Joi.object({ email: Joi.string().email().required() });

const resetSchema = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message('Password must be 8-64 characters and include uppercase, lowercase, digit and special character.')
    .required(),
});

const forgotEmailOtpSchema = Joi.object({ email: Joi.string().email().required() });

const resetEmailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message('Password must be 8-64 characters and include uppercase, lowercase, digit và đ?c bi?t.')
    .required(),
});

const forgotPhoneSchema = Joi.object({
  phone: Joi.string()
    .pattern(PHONE_REGEX)
    .messages({ 'string.pattern.base': 'Phone must contain exactly 10 digits.' })
    .required(),
});

const resetPhoneSchema = Joi.object({
  phone: Joi.string()
    .pattern(PHONE_REGEX)
    .messages({ 'string.pattern.base': 'Phone must contain exactly 10 digits.' })
    .required(),
  otp: Joi.string().length(6).required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message('Password must be 8-64 characters and include uppercase, lowercase, digit and special character.')
    .required(),
});

const redis = new Redis(config.get('redis.url'));

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatValidationError(details) {
  return details.reduce((acc, cur) => ({ ...acc, [cur.path.join('.')]: cur.message }), {});
}

async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const { email, password } = value;
    const user = await Staff.findOne({ where: { email } });
    if (!user || !user.is_active) throw new Unauthorized('Invalid credentials');
    const ok = await comparePassword(password, user.password);
    if (!ok) throw new Unauthorized('Invalid credentials');
    const pair = await TokenPair.create({
      id: user.staff_id,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || null,
      patient_id: user.patient_id,
      doctor_id: user.doctor_id || null,
    });
    res.json({
      access: pair.access,
      refresh: pair.refresh,
      token: pair.access,
      user: {
        id: user.staff_id,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || null,
        email: user.email,
        patient_id: user.patient_id,
        doctor_id: user.doctor_id || null,
      },
    });
    try {
      await audit.record('auth.login', user.staff_id, { email: user.email });
    } catch (err) {
      console.log('[AUDIT LOGIN ERROR]', err?.message);
    }
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const { first_name, last_name, email, password, role, phone } = value;
    const existing = await Staff.count({ where: { email } });
    if (existing) throw new BadRequest({ email: 'Email already in use' });
    const hashed = await hashPassword(password);
    const staff = await sequelize.transaction(async (transaction) => {
      const patient = await Patient.create(
        {
          first_name,
          last_name,
          contact_no: phone,
          email,
        },
        { transaction }
      );
      return Staff.create(
        {
          first_name,
          last_name,
          phone,
          email,
          password: hashed,
          role,
          patient_id: patient.patient_id,
        },
        { transaction }
      );
    });
    const user = {
      id: staff.staff_id,
      first_name,
      last_name,
      email,
      role,
      patient_id: staff.patient_id,
      doctor_id: staff.doctor_id || null,
      phone,
    };
    const pair = await TokenPair.create({
      id: user.id,
      role: user.role,
      first_name,
      last_name,
      email,
      phone,
      patient_id: user.patient_id,
      doctor_id: user.doctor_id,
    });
    res.status(201).json({ message: 'Registered', user, access: pair.access, refresh: pair.refresh, token: pair.access });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { access, refresh } = req.body || {};
    if (!access || !refresh) throw new BadRequest({ access: 'Required', refresh: 'Required' });
    const acc = await verify(access);
    const ref = await verify(refresh);
    if (ref.isInvalid || ref.isExpired) throw new Unauthorized('Invalid refresh');
    const pair = require('../providers/jwt').TokenPair.from(access, refresh);
    if (!pair) throw new Unauthorized('Invalid token pair');
    if (await pair.isRefreshed()) throw new Unauthorized('Refresh token already used');
    const payload = acc.payload || require('jsonwebtoken').decode(access);
    if (!payload?.jti) throw new Unauthorized('Invalid access token');
    const newPair = await TokenPair.create(
      {
        id: payload.id,
        role: payload.role,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone || null,
        patient_id: payload.patient_id,
        doctor_id: payload.doctor_id || null,
      },
      pair.jti
    );
    try {
      await pair.invalidateRefresh();
    } catch (_) {}
    res.json({ access: newPair.access, refresh: newPair.refresh, token: newPair.access });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { access, refresh } = req.body || {};
    if (!access || !refresh) throw new BadRequest({ access: 'Required', refresh: 'Required' });
    const pair = require('../providers/jwt').TokenPair.from(access, refresh);
    if (!pair) throw new Unauthorized('Invalid token pair');
    try {
      await pair.blackList();
    } catch (_) {}
    try {
      await pair.invalidateRefresh();
    } catch (_) {}
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const userId = req.user?.id;
    if (!userId) throw new Unauthorized();
    const user = await Staff.findByPk(userId);
    if (!user) throw new NotFound('User not found');
    const ok = await comparePassword(value.current_password, user.password);
    if (!ok) throw new Unauthorized('Current password does not match');
    const hashed = await hashPassword(value.new_password);
    await user.update({ password: hashed });
    res.json({ message: 'Password changed' });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { error, value } = forgotSchema.validate(req.body);
    if (error) throw new BadRequest(error);
    const user = await Staff.findOne({ where: { email: value.email }, attributes: ['staff_id', 'email'] });
    if (!user) return res.json({ message: 'If email exists, instructions sent' });
    const token = uuid();
    const key = `pwdreset:${token}`;
    await redis.set(key, String(user.staff_id), 'EX', 60 * 60);
    const link = (process.env.PORTAL_URL || 'http://localhost:5174') + `/reset?token=${token}`;
    await mail.send(user.email, 'Reset your password', mail.resetTemplate(link));
    res.json({ message: 'If email exists, instructions sent' });
  } catch (err) {
    next(err);
  }
}

async function forgotPasswordEmailOtp(req, res, next) {
  try {
    const { error, value } = forgotEmailOtpSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const user = await Staff.findOne({ where: { email: value.email }, attributes: ['staff_id', 'email'] });
    if (!user) return res.json({ message: 'If email exists, OTP sent' });
    const otp = generateOtp();
    await redis.set(`pwdotp:email:${value.email}`, JSON.stringify({ userId: user.staff_id, otp }), 'EX', 10 * 60);
    const html = `<p>Your HealthCare+ OTP is <strong>${otp}</strong></p><p>The code expires in 10 minutes.</p>`;
    await mail.send(user.email, 'HealthCare+ OTP', html, `HealthCare+ OTP: ${otp}`);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    next(err);
  }
}

async function resetPasswordEmailOtp(req, res, next) {
  try {
    const { error, value } = resetEmailOtpSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const key = `pwdotp:email:${value.email}`;
    const payload = await redis.get(key);
    if (!payload) throw new Unauthorized('OTP invalid or expired');
    const data = JSON.parse(payload);
    if (data.otp !== value.otp) throw new Unauthorized('OTP invalid or expired');
    const staff = await Staff.findByPk(Number(data.userId));
    if (!staff) throw new Unauthorized('User not found');
    const hashed = await hashPassword(value.new_password);
    await staff.update({ password: hashed });
    await redis.del(key);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}

async function forgotPasswordPhone(req, res, next) {
  try {
    const { error, value } = forgotPhoneSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const user = await Staff.findOne({ where: { phone: value.phone }, attributes: ['staff_id', 'phone'] });
    if (!user) return res.json({ message: 'If phone exists, OTP sent' });
    const otp = generateOtp();
    await redis.set(`pwdotp:phone:${value.phone}`, JSON.stringify({ userId: user.staff_id, otp }), 'EX', 10 * 60);
    console.log(`[PWD OTP][PHONE] ${value.phone} -> ${otp}`);
    res.json({ message: 'OTP sent to your phone' });
  } catch (err) {
    next(err);
  }
}

async function resetPasswordPhone(req, res, next) {
  try {
    const { error, value } = resetPhoneSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const key = `pwdotp:phone:${value.phone}`;
    const payload = await redis.get(key);
    if (!payload) throw new Unauthorized('OTP invalid or expired');
    const data = JSON.parse(payload);
    if (data.otp !== value.otp) throw new Unauthorized('OTP invalid or expired');
    const staff = await Staff.findByPk(Number(data.userId));
    if (!staff) throw new Unauthorized('User not found');
    const hashed = await hashPassword(value.new_password);
    await staff.update({ password: hashed });
    await redis.del(key);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { error, value } = resetSchema.validate(req.body, { abortEarly: false });
    if (error) throw new BadRequest(formatValidationError(error.details));
    const key = `pwdreset:${value.token}`;
    const userId = await redis.get(key);
    if (!userId) throw new Unauthorized('Invalid or expired token');
    const hashed = await hashPassword(value.new_password);
    const staff = await Staff.findByPk(Number(userId));
    if (!staff) throw new Unauthorized('User not found');
    await staff.update({ password: hashed });
    await redis.del(key);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Unauthorized();
    const user = await Staff.findByPk(userId, {
      attributes: ['staff_id', 'first_name', 'last_name', 'phone', 'email', 'role', 'is_active', 'patient_id'],
    });
    if (!user) throw new NotFound('User not found');
    res.json({
      id: user.staff_id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || null,
      email: user.email,
      role: user.role,
      is_active: !!user.is_active,
      patient_id: user.patient_id,
      doctor_id: user.doctor_id || null,
    });
  } catch (err) {
    next(err);
  }
}

const clientOrigin = process.env.PORTAL_URL || (config.has('client.url') ? config.get('client.url') : 'http://localhost:5173');

function sendOAuthWindowResponse(res, payload) {
  const body = `
<!DOCTYPE html>
<html lang="vi">
  <head><meta charset="utf-8"/><title>Đăng nh?p HealthCare+</title></head>
  <body>
    <script>
      (function () {
        try {
          const payload = ${JSON.stringify(payload)};
          if (window.opener) {
            window.opener.postMessage(payload, '${clientOrigin}');
          }
        } catch (err) {
          console.error(err);
        }
        window.close();
      })();
    </script>
    <p>N?u c?a s? không t? đóng, b?n có th? đóng b?ng tay.</p>
  </body>
</html>`;
  res.type('html').send(body);
}

async function socialSuccess(req, res) {
  try {
    const staff = req.user?.user || req.user;
    if (!staff) {
      return socialFailure(req, res);
    }
    const tokens = await issueTokenForStaff(staff);
    sendOAuthWindowResponse(res, { type: 'oauth-success', tokens });
  } catch (err) {
    console.log('[SOCIAL LOGIN ERROR]', err?.message);
    sendOAuthWindowResponse(res, { type: 'oauth-error', message: 'Không th? đăng nh?p v?i tài kho?n x? h?i.' });
  }
}

function socialFailure(req, res) {
  sendOAuthWindowResponse(res, {
    type: 'oauth-error',
    message: 'Đăng nh?p th?t b?i ho?c b? h?y. Vui l?ng th? l?i.',
  });
}

module.exports = {
  login,
  register,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  forgotPasswordEmailOtp,
  resetPasswordEmailOtp,
  forgotPasswordPhone,
  resetPasswordPhone,
  me,
  socialSuccess,
  socialFailure,
};


