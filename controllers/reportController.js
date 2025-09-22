const db = require('../config/db');

/**
 * A) INNER JOIN — Users who have at least one role
 */
exports.usersWithRoles = (req, res) => {
  const sql = `
    SELECT u.id, u.full_name, r.role_name
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.id
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
};

/**
 * B) LEFT JOIN — All users (with profile info if present)
 */
exports.usersWithProfiles = (req, res) => {
  const sql = `
    SELECT u.id, u.full_name, p.phone, p.city, p.country
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
};

/**
 * C) RIGHT JOIN — Keep all roles even if unassigned
 */
exports.rolesRightJoin = (req, res) => {
  const sql = `
    SELECT u.full_name, r.role_name
    FROM users u
    RIGHT JOIN user_roles ur ON u.id = ur.user_id
    RIGHT JOIN roles r ON ur.role_id = r.id
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
};

/**
 * D) FULL OUTER JOIN (emulated in MySQL with UNION)
 */
exports.profilesFullOuter = (req, res) => {
  const sql = `
    SELECT u.id, u.full_name, p.phone, p.city, p.country
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    UNION
    SELECT u.id, u.full_name, p.phone, p.city, p.country
    FROM users u
    RIGHT JOIN profiles p ON u.id = p.user_id
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
};

/**
 * E) CROSS JOIN — Every user × every role
 */
exports.userRoleCombos = (req, res) => {
  const sql = `
    SELECT u.full_name, r.role_name
    FROM users u
    CROSS JOIN roles r
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
};

/**
 * F) SELF JOIN — Who referred whom
 */
exports.referrals = (req, res) => {
  const sql = `
    SELECT u.full_name AS referrer, r.full_name AS referred
    FROM referrals rf
    INNER JOIN users u ON rf.referrer_user_id = u.id
    INNER JOIN users r ON rf.referred_user_id = r.id
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
};

/**
 * G) Bonus — Latest login per user
 */
exports.latestLogin = (req, res) => {
  const sql = `
    SELECT la.user_id, u.full_name, la.ip_address, la.success, la.created_at AS login_time
    FROM login_audit la
    INNER JOIN users u ON la.user_id = u.id
    WHERE la.created_at = (
      SELECT MAX(la2.created_at)
      FROM login_audit la2
      WHERE la2.user_id = la.user_id
    )
  `;
  db.query(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows);
  });
};
