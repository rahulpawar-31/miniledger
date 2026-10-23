import { pool } from "./db.js";
import { HttpError, validAmount, validDate, validFriendName } from "./validate.js";

// What the API sends back for one loan. "overdue" is worked out by the database:
// not repaid yet AND the due date is before today.
const LOAN_COLUMNS = `
  id,
  friend_name AS "friendName",
  amount::float8 AS amount,
  due_date AS "dueDate",
  repaid,
  repaid_at AS "repaidAt",
  (NOT repaid AND due_date < CURRENT_DATE) AS overdue`;

export async function addLoan(userId: number, body: Record<string, unknown>) {
  const friendName = validFriendName(body.friendName);
  const amount = validAmount(body.amount);
  const dueDate = validDate(body.dueDate);
  const result = await pool.query(
    `INSERT INTO loans (user_id, friend_name, amount, due_date)
     VALUES ($1, $2, $3, $4) RETURNING ${LOAN_COLUMNS}`,
    [userId, friendName, amount, dueDate],
  );
  return result.rows[0];
}

export async function listLoans(userId: number) {
  // Overdue first, then the soonest due date.
  const result = await pool.query(
    `SELECT ${LOAN_COLUMNS} FROM loans WHERE user_id = $1
     ORDER BY repaid ASC, due_date ASC`,
    [userId],
  );
  return result.rows;
}

export async function markRepaid(userId: number, loanId: number) {
  // "AND user_id = $2" stops one user from changing another user's loan.
  const result = await pool.query(
    `UPDATE loans SET repaid = true, repaid_at = COALESCE(repaid_at, now())
     WHERE id = $1 AND user_id = $2 RETURNING ${LOAN_COLUMNS}`,
    [loanId, userId],
  );
  if (result.rowCount === 0) throw new HttpError(404, "loan not found");
  return result.rows[0];
}

export async function summary(userId: number) {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(amount), 0)::float8                                              AS "totalLent",
       COALESCE(SUM(amount) FILTER (WHERE repaid), 0)::float8                        AS "totalRepaid",
       COALESCE(SUM(amount) FILTER (WHERE NOT repaid AND due_date < CURRENT_DATE), 0)::float8 AS "overdueAmount"
     FROM loans WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0];
}
