const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = function auth(required = true) {
  return (req, res, next) => {
    try {
      const header = req.headers['authorization'] || '';
      const [, token] = header.split(' ');
      if (!token) return required ? res.status(401).json({ error: 'missing bearer token' }) : next();

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      db.query('SELECT id FROM revoked_tokens WHERE jti=? LIMIT 1', [payload.jti], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length) return res.status(401).json({ error: 'token revoked' });

        req.user = { id: payload.sub, email: payload.email, role: payload.role || 'student', jti: payload.jti };
        next();
      });
    } catch {
      return res.status(401).json({ error: 'invalid or expired token' });
    }
  };
};