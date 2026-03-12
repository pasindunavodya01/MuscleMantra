const bcrypt = require("bcryptjs");
const { signAccessToken } = require("../../services/tokens");
const { loginSchema } = require("../validators/authValidators");

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = await req.app.locals.repo.getUserByEmail(email.toLowerCase());
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const token = signAccessToken({ userId: user.id, role: user.role }, req.app.locals.jwtSecret);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { login, me };

