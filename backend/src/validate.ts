// Small input checks. Each function returns the clean value, or throws HttpError(400).

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function validPhone(input: unknown): string {
  const phone = String(input ?? "").replace(/[\s-]/g, "");
  if (!/^\+?\d{10,15}$/.test(phone)) {
    throw new HttpError(400, "phone must be 10 to 15 digits, for example +919876543210");
  }
  return phone;
}

export function validFriendName(input: unknown): string {
  const name = String(input ?? "").trim();
  if (name.length < 1 || name.length > 100) {
    throw new HttpError(400, "friendName must be 1 to 100 characters");
  }
  return name;
}

export function validAmount(input: unknown): number {
  const amount = Math.round(Number(input) * 100) / 100; // keep 2 decimal places
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
    throw new HttpError(400, "amount must be a number greater than 0");
  }
  return amount;
}

export function validDate(input: unknown): string {
  const text = String(input ?? "");
  const parsed = new Date(`${text}T00:00:00Z`);
  const isReal = /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(text);
  if (!isReal) throw new HttpError(400, "dueDate must be a real date like 2026-11-30");
  return text;
}

export function validId(input: unknown): number {
  const id = Number(input);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "id must be a positive whole number");
  return id;
}

export function validOtp(input: unknown): string {
  const otp = String(input ?? "").trim();
  if (!/^\d{6}$/.test(otp)) throw new HttpError(400, "otp must be 6 digits");
  return otp;
}
