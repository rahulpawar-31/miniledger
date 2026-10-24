import { randomInt } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { pool } from "./db.js";
import { HttpError, validOtp, validPhone } from "./validate.js";

const OTP_MINUTES = 5;
const MAX_WRONG_TRIES = 5; // after this many wrong guesses the code is thrown away

// Step 1 of login: make a 6 digit code and store it. A real app would send an SMS.
// The task says to mock it, so we only print the code in the server log.
export async function requestOtp(phoneInput: unknown): Promise<void> {
  const phone = validPhone(phoneInput);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await pool.query(
    `INSERT INTO otps (phone, code, expires_at)
     VALUES ($1, $2, now() + make_interval(mins => $3))
     ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = now() + make_interval(mins => $3), attempts = 0`,
    [phone, code, OTP_MINUTES],
  );
  console.log(`[MOCK OTP] ${phone} -> ${code} (valid ${OTP_MINUTES} minutes)`);
}

// Step 2 of login: check the code. If it is right, create the user (first time)
// and return a signed token the app sends with every later request.
export async function verifyOtp(phoneInput: unknown, otpInput: unknown): Promise<string> {
  const phone = validPhone(phoneInput);
  const otp = validOtp(otpInput);

  const found = await pool.query(
    "DELETE FROM otps WHERE phone = $1 AND code = $2 AND expires_at > now() RETURNING phone",
    [phone, otp],
  ); // DELETE ... RETURNING makes the code usable only once
  if (found.rowCount === 0) {
    // Count the miss, and drop the code once it has been guessed wrong too often.
    await pool.query("UPDATE otps SET attempts = attempts + 1 WHERE phone = $1", [phone]);
    await pool.query("DELETE FROM otps WHERE phone = $1 AND attempts >= $2", [phone, MAX_WRONG_TRIES]);
    throw new HttpError(401, "wrong or expired OTP");
  }

  const user = await pool.query(
    "INSERT INTO users (phone) VALUES ($1) ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone RETURNING id",
    [phone],
  );
  const userId: number = user.rows[0].id;
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });
}

// Middleware: runs before protected routes. Reads "Authorization: Bearer <token>".
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number };
    (req as Request & { userId: number }).userId = payload.userId;
    next();
  } catch {
    next(new HttpError(401, "please log in"));
  }
}
