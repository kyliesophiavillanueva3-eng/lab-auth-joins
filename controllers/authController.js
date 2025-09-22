const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function signToken(user) {
  const jti = uuidv4().replace(/-/g, '').slice(0, 32);
  const payload = { sub: user.id, email: user.email, role: user.role || 'student', jti };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1h' });
  return { token, jti };
}

exports.signup = (req, res) => {
  const { email, password, full_name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const hash = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [email, hash, full_name || null, role || 'student'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already registered' });
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'signup successful', userId: result.insertId });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  db.query('SELECT id, email, password_hash, role FROM users WHERE email=? LIMIT 1', [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });

    const user = rows[0];
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const { token } = signToken(user);
    res.json({ message: 'login successful', token, profile: { id: user.id, email: user.email, role: user.role } });
  });
};

exports.logout = (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const [, token] = authHeader.split(' ');
  if (!token) return res.status(400).json({ error: 'missing bearer token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(payload.exp * 1000);
    db.query('INSERT IGNORE INTO revoked_tokens (jti, expires_at) VALUES (?, ?)', [payload.jti, expiresAt], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'logout successful (token revoked)' });
    });
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
};

exports.profile = (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
};