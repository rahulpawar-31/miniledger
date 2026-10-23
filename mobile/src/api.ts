import { API_URL } from "./config";

export type Loan = {
  id: number;
  friendName: string;
  amount: number;
  dueDate: string; // "YYYY-MM-DD"
  repaid: boolean;
  repaidAt: string | null;
  overdue: boolean;
};

export type Summary = { totalLent: number; totalRepaid: number; overdueAmount: number };

// Thrown when the server says 401, so the app can send the user back to the login screen.
export class AuthError extends Error {}

// One helper for every call: adds the token, reads the JSON, turns errors into messages.
async function call<T>(path: string, method: string, token?: string, body?: object): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running and the phone on the same Wi-Fi?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) throw new AuthError(data.error ?? "please log in");
    throw new Error(data.error ?? "Something went wrong");
  }
  return data as T;
}

export const requestOtp = (phone: string) => call<{ message: string }>("/auth/request-otp", "POST", undefined, { phone });
export const verifyOtp = (phone: string, otp: string) =>
  call<{ token: string }>("/auth/verify-otp", "POST", undefined, { phone, otp });

export const getLoans = (token: string) => call<Loan[]>("/loans", "GET", token);
export const getSummary = (token: string) => call<Summary>("/summary", "GET", token);
export const addLoan = (token: string, friendName: string, amount: number, dueDate: string) =>
  call<Loan>("/loans", "POST", token, { friendName, amount, dueDate });
export const markRepaid = (token: string, id: number) => call<Loan>(`/loans/${id}/repaid`, "PATCH", token);
