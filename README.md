Lab Auth API – Reports and SQL JOINs

This project includes endpoints that demonstrate different SQL JOINs for users, roles, and profiles.

SQL JOIN Types – Short Explanation
JOIN Type	Purpose / Example
INNER JOIN	Returns only rows with matches in both tables. Example: users with at least one role.
LEFT JOIN	Returns all rows from the left table, with matched right table rows if available. Example: all users with profile info.
RIGHT JOIN	Returns all rows from the right table, with matched left table rows if available. Example: all roles including unassigned.
FULL OUTER JOIN (emulated with UNION)	Returns all rows from both tables; unmatched columns show NULL. Example: all users and profiles combined.
CROSS JOIN	Returns all possible combinations of rows between two tables. Example: every user × every role.
SELF JOIN	Joins a table to itself. Example: who referred whom in a referral system.
Latest login per user	Uses a subquery with MAX to get the most recent login for each user.
/api/reports Endpoints and Purpose
Endpoint	Purpose
/api/reports/users-with-roles	Lists users with at least one role (INNER JOIN).
/api/reports/users-with-profiles	Lists all users with profile info if present (LEFT JOIN).
/api/reports/roles-right-join	Returns all roles, including unassigned ones (RIGHT JOIN).
/api/reports/profiles-full-outer	Shows all users and profiles, even if one is missing (FULL OUTER JOIN emulated).
/api/reports/user-role-combos	Shows every possible user-role combination (CROSS JOIN).
/api/reports/referrals	Shows referral relationships: who referred whom (SELF JOIN).
/api/reports/latest-login	Shows the most recent login for each user (LEFT JOIN + subquery).
