const Joi = require("joi");
const { TokenPair, verify } = require("../providers/jwt");
const { hashPassword, comparePassword } = require("../providers/hash");
const { Unauthorized, BadRequest, NotFound } = require("../../helpers/errors");
const { v4: uuidv4 } = require("uuid");
const Redis = require("ioredis");
const config = require("config");
const mail = require("../providers/mail");
const { audit } = require("../providers");
const { Staff, Patient, sequelize } = require("../database");
const { issueTokenForStaff } = require("../services/auth.service");

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>\/?]).{8,64}$/;
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
    .messages({ "string.pattern.base": "Phone must contain exactly 10 digits." })
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message(
      "Password must be 8-64 characters and include uppercase, lowercase, digit and special character."
    )
    .required(),
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message(
      "Password must be 8-64 characters and include uppercase, lowercase, digit and special character."
    )
    .required(),
});

const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetSchema = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message(
      "Password must be 8-64 characters and include uppercase, lowercase, digit and special character."
    )
    .required(),
});

const forgotEmailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetEmailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message(
      "Password must be 8-64 characters and include uppercase, lowercase, digit and special character."
    )
    .required(),
});

const forgotPhoneSchema = Joi.object({
  phone: Joi.string()
    .pattern(PHONE_REGEX)
    .messages({ "string.pattern.base": "Phone must contain exactly 10 digits." })
    .required(),
});

const resetPhoneSchema = Joi.object({
  phone: Joi.string()
    .pattern(PHONE_REGEX)
    .messages({ "string.pattern.base": "Phone must contain exactly 10 digits." })
    .required(),
  otp: Joi.string().length(6).required(),
  new_password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .message(
      "Password must be 8-64 characters and include uppercase, lowercase, digit and special character."
    )
    .required(),
});

const redis = new Redis(config.get("redis.url"));

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatValidationError(details) {
  return details.reduce((acc, cur) => {
    acc[cur.path.join(".")] = cur.message;
    return acc;
  }, {});
}

async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { email, password } = value;
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return next(new Unauthorized("Tài khoản hoặc mật khẩu không đúng."));
    }

    const ok = await comparePassword(password, staff.password);
    if (!ok) {
      return next(new Unauthorized("Tài khoản hoặc mật khẩu không đúng."));
    }

    const tokenPair = await TokenPair.create({
      payload: {
        sub: staff.id,
        email: staff.email,
        role: staff.role || "user",
      },
    });

    await audit.record("auth.login", { userId: staff.id, email: staff.email });

    return res.json({
      token: tokenPair,
      user: {
        id: staff.id,
        email: staff.email,
        role: staff.role || "user",
        first_name: staff.first_name,
        last_name: staff.last_name,
        phone: staff.phone,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function register(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      await t.rollback();
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { first_name, last_name, phone, email, password } = value;

    const existing = await Staff.findOne({ where: { email }, transaction: t });
    if (existing) {
      await t.rollback();
      return next(new BadRequest("Email đã được sử dụng."));
    }

    const passwordHash = await hashPassword(password);

    const patient = await Patient.create(
      {
        id: uuidv4(),
        first_name,
        last_name,
        phone,
        email,
      },
      { transaction: t }
    );

    const staff = await Staff.create(
      {
        id: uuidv4(),
        first_name,
        last_name,
        phone,
        email,
        password: passwordHash,
        role: "patient",
        patient_id: patient.id,
      },
      { transaction: t }
    );

    await t.commit();

    const tokenPair = await TokenPair.create({
      payload: {
        sub: staff.id,
        email: staff.email,
        role: "patient",
      },
    });

    await audit.record("auth.register", { userId: staff.id, email: staff.email });

    return res.status(201).json({
      token: tokenPair,
      user: {
        id: staff.id,
        email: staff.email,
        role: staff.role,
        first_name: staff.first_name,
        last_name: staff.last_name,
        phone: staff.phone,
      },
    });
  } catch (err) {
    await t.rollback();
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return next(new BadRequest("Thiếu refresh token."));
    }

    const payload = await verify(refresh_token);
    if (!payload || !payload.sub) {
      return next(new Unauthorized("Refresh token không hợp lệ."));
    }

    const staff = await Staff.findByPk(payload.sub);
    if (!staff) {
      return next(new Unauthorized("Tài khoản không tồn tại."));
    }

    const tokenPair = await TokenPair.create({
      payload: {
        sub: staff.id,
        email: staff.email,
        role: staff.role || payload.role || "user",
      },
    });

    return res.json({ token: tokenPair });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) {
      await TokenPair.revoke(refresh_token);
    }
    return res.json({ message: "Đăng xuất thành công." });
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { error, value } = changePasswordSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { current_password, new_password } = value;
    const userId = req.user?.id;

    const staff = await Staff.findByPk(userId);
    if (!staff) {
      return next(new NotFound("Người dùng không tồn tại."));
    }

    const ok = await comparePassword(current_password, staff.password);
    if (!ok) {
      return next(new Unauthorized("Mật khẩu hiện tại không đúng."));
    }

    const newHash = await hashPassword(new_password);
    staff.password = newHash;
    await staff.save();

    await audit.record("auth.change_password", { userId: staff.id });

    return res.json({ message: "Đổi mật khẩu thành công." });
  } catch (err) {
    return next(err);
  }
}

async function forgot(req, res, next) {
  try {
    const { error, value } = forgotSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { email } = value;
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return next(new NotFound("Email không tồn tại."));
    }

    const otp = generateOtp();
    await redis.set(`reset:${email}`, otp, "EX", 10 * 60);

    await mail.send({
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      text: `Mã OTP của bạn là ${otp}. OTP có hiệu lực trong 10 phút.`,
    });

    return res.json({ message: "Đã gửi OTP tới email." });
  } catch (err) {
    return next(err);
  }
}

async function reset(req, res, next) {
  try {
    const { error, value } = resetSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { token, new_password } = value;
    const payload = await verify(token);
    if (!payload?.sub) {
      return next(new Unauthorized("Token không hợp lệ hoặc hết hạn."));
    }

    const staff = await Staff.findByPk(payload.sub);
    if (!staff) {
      return next(new NotFound("Tài khoản không tồn tại."));
    }

    const newHash = await hashPassword(new_password);
    staff.password = newHash;
    await staff.save();

    await audit.record("auth.reset_password", { userId: staff.id });

    return res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    return next(err);
  }
}

async function forgotEmailOtp(req, res, next) {
  try {
    const { error, value } = forgotEmailOtpSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { email } = value;
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return next(new NotFound("Email không tồn tại."));
    }

    const otp = generateOtp();
    await redis.set(`reset:${email}`, otp, "EX", 10 * 60);

    await mail.send({
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      text: `Mã OTP của bạn là ${otp}. OTP có hiệu lực trong 10 phút.`,
    });

    return res.json({ message: "Đã gửi OTP tới email." });
  } catch (err) {
    return next(err);
  }
}

async function resetEmailOtp(req, res, next) {
  try {
    const { error, value } = resetEmailOtpSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { email, otp, new_password } = value;
    const cached = await redis.get(`reset:${email}`);
    if (!cached || cached !== otp) {
      return next(new Unauthorized("OTP không hợp lệ hoặc hết hạn."));
    }

    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return next(new NotFound("Tài khoản không tồn tại."));
    }

    const newHash = await hashPassword(new_password);
    staff.password = newHash;
    await staff.save();
    await redis.del(`reset:${email}`);

    await audit.record("auth.reset_password_email_otp", { userId: staff.id });

    return res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    return next(err);
  }
}

async function forgotPhoneOtp(req, res, next) {
  try {
    const { error, value } = forgotPhoneSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { phone } = value;
    const staff = await Staff.findOne({ where: { phone } });
    if (!staff) {
      return next(new NotFound("Số điện thoại không tồn tại."));
    }

    const otp = generateOtp();
    await redis.set(`reset:${phone}`, otp, "EX", 10 * 60);

    // TODO: gửi OTP qua SMS provider thực tế.
    return res.json({ message: "Đã tạo OTP. (demo: kiểm tra redis)", otp_demo: otp });
  } catch (err) {
    return next(err);
  }
}

async function resetPhoneOtp(req, res, next) {
  try {
    const { error, value } = resetPhoneSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(
        new BadRequest("Dữ liệu không hợp lệ.", formatValidationError(error.details))
      );
    }

    const { phone, otp, new_password } = value;
    const cached = await redis.get(`reset:${phone}`);
    if (!cached || cached !== otp) {
      return next(new Unauthorized("OTP không hợp lệ hoặc hết hạn."));
    }

    const staff = await Staff.findOne({ where: { phone } });
    if (!staff) {
      return next(new NotFound("Tài khoản không tồn tại."));
    }

    const newHash = await hashPassword(new_password);
    staff.password = newHash;
    await staff.save();
    await redis.del(`reset:${phone}`);

    await audit.record("auth.reset_password_phone_otp", { userId: staff.id });

    return res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    return next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const userId = req.user?.id;
    const staff = await Staff.findByPk(userId, {
      include: [{ model: Patient, as: "patient" }],
    });
    if (!staff) {
      return next(new NotFound("Người dùng không tồn tại."));
    }
    return res.json({
      id: staff.id,
      email: staff.email,
      role: staff.role,
      first_name: staff.first_name,
      last_name: staff.last_name,
      phone: staff.phone,
      patient: staff.patient,
    });
  } catch (err) {
    return next(err);
  }
}

async function socialSuccess(req, res, next) {
  try {
    const { email } = req.user || {};
    if (!email) {
      return next(new Unauthorized("Không thể xác thực người dùng."));
    }
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return next(new Unauthorized("Tài khoản không tồn tại."));
    }

    const tokenPair = await TokenPair.create({
      payload: {
        sub: staff.id,
        email: staff.email,
        role: staff.role || "user",
      },
    });

    return res.json({ token: tokenPair });
  } catch (err) {
    return next(err);
  }
}

async function socialFailure(req, res, next) {
  return next(new Unauthorized("Xác thực mạng xã hội thất bại."));
}

function sendOAuthWindowResponse(res, success, message) {
  const html = [
    "<html><body><script>",
    "const payload = { success: " + (success ? "true" : "false") + ", message: '" + message + "' };",
    "window.opener && window.opener.postMessage({ type: 'oauth_result', payload }, '*');",
    "window.close();",
    "</script></body></html>",
  ].join("");
  return res.send(html);
}

const forgotPassword = forgot;
const resetPassword = reset;
const forgotPasswordEmailOtp = forgotEmailOtp;
const resetPasswordEmailOtp = resetEmailOtp;
const forgotPasswordPhone = forgotPhoneOtp;
const resetPasswordPhone = resetPhoneOtp;
const me = getProfile;

module.exports = {
  login,
  register,
  refresh,
  logout,
  changePassword,
  forgot,
  reset,
  forgotEmailOtp,
  resetEmailOtp,
  forgotPhoneOtp,
  resetPhoneOtp,
  getProfile,
  socialSuccess,
  socialFailure,
  sendOAuthWindowResponse,
  // aliases for routes
  forgotPassword,
  resetPassword,
  forgotPasswordEmailOtp,
  resetPasswordEmailOtp,
  forgotPasswordPhone,
  resetPasswordPhone,
  me,
};
